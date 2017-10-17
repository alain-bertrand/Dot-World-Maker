// Conversion to Typescript by Alain Bertrand
// seedrandom.js version 2.1.
// Author: David Bau
// Date: 2013 Mar 16
//
// Defines a method Math.seedrandom() that, when called, substitutes
// an explicitly seeded RC4-based algorithm for Math.random().  Also
// supports automatic seeding from local or network sources of entropy.
//
// http://davidbau.com/encode/seedrandom.js
// http://davidbau.com/encode/seedrandom-min.js
//
// Usage:
//
//   <script src=http://davidbau.com/encode/seedrandom-min.js></script>
//
//   Math.seedrandom('yay.');  Sets Math.random to a function that is
//                             initialized using the given explicit seed.
//
//   Math.seedrandom();        Sets Math.random to a function that is
//                             seeded using the current time, dom state,
//                             and other accumulated local entropy.
//                             The generated seed string is returned.
//
//   Math.seedrandom('yowza.', true);
//                             Seeds using the given explicit seed mixed
//                             together with accumulated entropy.
//
//   <script src="https://jsonlib.appspot.com/urandom?callback=Math.seedrandom">
//   </script>                 Seeds using urandom bits from a server.
//
// More advanced examples:
//
//   Math.seedrandom("hello.");           // Use "hello." as the seed.
//   document.write(Math.random());       // Always 0.9282578795792454
//   document.write(Math.random());       // Always 0.3752569768646784
//   var rng1 = Math.random;              // Remember the current prng.
//
//   var autoseed = Math.seedrandom();    // New prng with an automatic seed.
//   document.write(Math.random());       // Pretty much unpredictable x.
//
//   Math.random = rng1;                  // Continue "hello." prng sequence.
//   document.write(Math.random());       // Always 0.7316977468919549
//
//   Math.seedrandom(autoseed);           // Restart at the previous seed.
//   document.write(Math.random());       // Repeat the 'unpredictable' x.
//
//   function reseed(event, count) {      // Define a custom entropy collector.
//     var t = [];
//     function w(e) {
//       t.push([e.pageX, e.pageY, +new Date]);
//       if (t.length < count) { return; }
//       document.removeEventListener(event, w);
//       Math.seedrandom(t, true);        // Mix in any previous entropy.
//     }
//     document.addEventListener(event, w);
//   }
//   reseed('mousemove', 100);            // Reseed after 100 mouse moves.
//
// Version notes:
//
// The random number sequence is the same as version 1.0 for string seeds.
// Version 2.0 changed the sequence for non-string seeds.
// Version 2.1 speeds seeding and uses window.crypto to autoseed if present.
//
// The standard ARC4 key scheduler cycles short keys, which means that
// seedrandom('ab') is equivalent to seedrandom('abab') and 'ababab'.
// Therefore it is a good idea to add a terminator to avoid trivial
// equivalences on short string seeds, e.g., Math.seedrandom(str + '\0').
// Starting with version 2.0, a terminator is added automatically for
// non-string seeds, so seeding with the number 111 is the same as seeding
// with '111\0'.
//
// When seedrandom() is called with zero args, it uses a seed
// drawn from the browser crypto object if present.  If there is no
// crypto support, seedrandom() uses the current time, the native rng,
// and a walk of several DOM objects to collect a few bits of entropy.
//
// Each time the one- or two-argument forms of seedrandom are called,
// entropy from the passed seed is accumulated in a pool to help generate
// future seeds for the zero- and two-argument forms of seedrandom.
//
// On speed - This javascript implementation of Math.random() is about
// 3-10x slower than the built-in Math.random() because it is not native
// code, but that is typically fast enough.  Some details (timings on
// Chrome 25 on a 2010 vintage macbook):
//
// seeded Math.random()          - avg less than 0.0002 milliseconds per call
// seedrandom('explicit.')       - avg less than 0.2 milliseconds per call
// seedrandom('explicit.', true) - avg less than 0.2 milliseconds per call
// seedrandom() with crypto      - avg less than 0.2 milliseconds per call
// seedrandom() without crypto   - avg about 12 milliseconds per call
//
// On a 2012 windows 7 1.5ghz i5 laptop, Chrome, Firefox 19, IE 10, and
// Opera have similarly fast timings.  Slowest numbers are on Opera, with
// about 0.0005 milliseconds per seeded Math.random() and 15 milliseconds
// for autoseeding.
//
// LICENSE (BSD):
//
// Copyright 2013 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
/**
 * All code is in an anonymous closure to keep the global namespace clean.
 */
class SeededRandom
{

    //
    // The following constants are related to IEEE 754 limits.
    //
    private startdenom: number;
    private significance: number;
    private overflow: number;
    private mask: number;
    private pool = [];
    // width: each RC4 output is 0 <= x < 256
    private width: number = 256;
    // chunks: at least six RC4 outputs for each double
    private chunks: number = 6;
    // digits: there are 52 significant digits in a double
    private digits: number = 52;
    private arc4: ARC4;

    constructor(width?: number, chunks?: number, digits?: number)
    {
        if (width)
            this.width = width;
        if (chunks)
            this.chunks = chunks;
        if (digits)
            this.digits = digits;

        this.startdenom = Math.pow(this.width, this.chunks);
        this.significance = Math.pow(2, digits);
        this.overflow = this.significance * 2;
        this.mask = this.width - 1;

        this.mixkey(Math.random(), this.pool);
    }

    //
    // seedrandom()
    // This is the seedrandom function described above.
    //
    public Seed(seed, use_entropy?)
    {
        var key = [];

        // Flatten the seed string or build one from local entropy if needed.
        var shortseed = this.mixkey(this.flatten(
            use_entropy ? [seed, this.tostring(this.pool)] :
                0 in arguments ? seed : this.autoseed(), 3), key);

        // Use the seed to initialize an ARC4 generator.
        this.arc4 = new ARC4(key, this.width, this.mask);

        // Mix the randomness into accumulated entropy.
        this.mixkey(this.tostring(this.arc4.S), this.pool);

        // Override Math.random

        // This function returns a random double in [0, 1) that contains
        // randomness in every bit of the mantissa of the IEEE 754 value.

        // Return the seed that was used
        return shortseed;
    };

    public Next(): number;

    public Next(max: number): number

    public Next(min: number, max: number): number;

    public Next(min?: number, max?: number): number
    {
        if (!min)
            return this.next();
        if (!max)
            return Math.round(this.next() * min);
        return Math.round(this.next() * (max - min)) + min;
    }

    private next()
    {         // Closure to return a random double:
        var n = this.arc4.g(this.chunks),             // Start with a numerator n < 2 ^ 48
            d = this.startdenom,                 //   and denominator d = 2 ^ 48.
            x = 0;                          //   and no 'extra last byte'.
        while (n < this.significance)
        {          // Fill up all significant digits by
            n = (n + x) * this.width;              //   shifting numerator and
            d *= this.width;                       //   denominator and generating a
            x = this.arc4.g(1);                    //   new least-significant-byte.
        }
        while (n >= this.overflow)
        {             // To avoid rounding up, before adding
            n /= 2;                           //   last byte, shift everything
            d /= 2;                           //   right using integer math until
            x >>>= 1;                         //   we have exactly the desired bits.
        }
        return (n + x) / d;                 // Form the number within [0, 1).
    };

    //
    // flatten()
    // Converts an object tree to nested arrays of strings.
    //
    private flatten(obj, depth)
    {
        var result = [], typ = (typeof obj)[0], prop;
        if (depth && typ == 'o')
        {
            for (prop in obj)
            {
                if (obj.hasOwnProperty(prop))
                {
                    try
                    {
                        result.push(this.flatten(obj[prop], depth - 1));
                    } catch (e)
                    {
                    }
                }
            }
        }
        return (result.length ? result : typ == 's' ? obj : obj + '\0');
    }

    //
    // mixkey()
    // Mixes a string seed into a key that is an array of integers, and
    // returns a shortened string seed that is equivalent to the result key.
    //
    private mixkey(seed, key)
    {
        var stringseed = seed + '', smear, j = 0;
        while (j < stringseed.length)
        {
            key[this.mask & j] =
                this.mask & ((smear ^= key[this.mask & j] * 19) + stringseed.charCodeAt(j++));
        }
        return this.tostring(key);
    }

    //
    // autoseed()
    // Returns an object for autoseeding, using window.crypto if available.
    //
    /** @param {Uint8Array=} seed */
    private autoseed(seed?)
    {
        try
        {
            window.crypto.getRandomValues(seed = new Uint8Array(this.width));
            return this.tostring(seed);
        } catch (e)
        {
            return [+new Date, window.document, window.history,
                window.navigator, window.screen, this.tostring(this.pool)];
        }
    }

    //
    // tostring()
    // Converts an array of charcodes to a string
    //
    private tostring(a)
    {
        return String.fromCharCode.apply(0, a);
    }
}

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//

class ARC4
{
    private t;
    private keylen;
    public S = [];
    private i = 0;
    private j = 0;
    private width;
    private mask;

    constructor(key, width, mask)
    {
        this.keylen = key.length;
        this.width = width;
        this.mask = mask;

        this.S = [];

        // The empty key [] is treated as [0].
        if (!this.keylen)
        {
            key = [this.keylen++];
        }

        // Set up S using the standard key scheduling algorithm.
        while (this.i < width)
        {
            this.S[this.i] = this.i++;
        }
        for (this.i = 0; this.i < width; this.i++)
        {
            this.S[this.i] = this.S[this.j = mask & (this.j + key[this.i % this.keylen] + (this.t = this.S[this.i]))];
            this.S[this.j] = this.t;
        }
    }

    public g(count)
    {
        // Using instance members instead of closure state nearly doubles speed.
        var t, r = 0;
        while (count--)
        {
            t = this.S[this.i = this.mask & (this.i + 1)];
            r = r * this.width + this.S[this.mask & ((this.S[this.i] = this.S[this.j = this.mask & (this.j + t)]) + (this.S[this.j] = t))];
        }
        return r;
        // For robust unpredictability discard an initial batch of values.
        // See http://www.rsa.com/rsalabs/node.asp?id=2009
    }
}
