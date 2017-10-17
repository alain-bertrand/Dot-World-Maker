var npcNames = new (class
{
    public firstNames: string[] = ["Adelaide", "Aleida", "Alexia", "Alianor", "Alice", "Althalos", "Amelia", "Anastas", "Angmar", "Anne", "Arabella", "Ariana",
        "Arthur", "Asher", "Atheena", "Ayleth", "Barda", "Beatrix", "Benedict", "Benevolence", "Berinon", "Borin", "Brangian", "Brom",
        "Brunhild", "Bryce", "Carac", "Cassius", "Catherine", "Catrain", "Cedany", "Cedric", "Charles", "Clifton", "Cornwallis", "Cristiana",
        "Dain", "Destrian", "Dimia", "Donald", "Doran", "Duraina", "Edmund", "Eleanor", "Elizabeth", "Emeline", "Enndolynn", "Falk",
        "Farfelee", "Favian", "Fendrel", "Forthwind", "Francis", "Frederick", "Gavin", "Gavin", "Geoffrey", "Gloriana", "Godiva", "Gorvenal",
        "Gregory", "Guinevere", "Gussalen", "Gwendolynn", "Hadrian", "Helena", "Helena", "Helewys", "Henry", "Hildegard", "Isabel", "Iseult",
        "Isolde", "Jacquelyn", "Janet", "Janshai", "Jarin", "Jasmine", "John", "John", "Josef", "Joseph", "Josselyn", "Juliana", "Justice", "Katelyn",
        "Katrina", "Kaylein", "Krea", "Leo", "Leofrick", "Letholdus", "Lief", "Loreena", "Luanda", "Maerwynn", "Malkyn", "Margaret", "Maria", "Mary",
        "Matilda", "Merek", "Millicent", "Mirabelle", "Muriel", "Oliver", "Peronell", "Peter", "Peyton", "Phrowenia", "Quinn", "Rainydayas", "Robin",
        "Roger", "Ronald", "Rose", "Rowan", "Rulf", "Ryia", "Sadon", "Seraphina", "Sibyl", "Simon", "Terrin", "Terrowin", "Terryn", "Thea", "Thomas",
        "Tristan", "Tybalt", "Ulric", "Victoria", "Walter", "William", "Winifred", "Xalvador", "Ysmay", "Zane"];
    public firstPart: string[] = ["Long", "Short", "Kink", "Brown", "Red", "Small", "Big", "Short", "Swift", "Quick", "Slow", "Odd",
        "Cute", "Nice", "Ugly", "Dead", "Beautiful", "Meaningless", "Adorable", "Gorgeous", "Broken", "Aged", "Aggresive", "Angry", "Amused",
        "Antique", "Ashamed", "Austere", "Awerage", "Bad", "Bare", "Basic", "Beloved", "Black", "Blue", "Bleak", "Brisk", "Bruised", "Busy",
        "Brave", "Bulky", "Blushing", "Calm", "Deep", "Dim", "Dirty", "Double", "Drab", "Dicrete", "Dual", "Dull", "Fat", "Fond", "Frugal",
        "Fumbling", "Flawless", "Few", "Glum", "Glossy", "Grim", "Grown", "Giant", "Hairy", "Handy", "Harsh", "Hot", "Huge"];
    public middlePart: string[] = ["nose", "head", "leg", "foot", "arm", "eye", "hear", "hair", "thumb", "finger", "nail", "neck", "tongue",
        "chest", "knee", "eyebrow", "mouth", "shoulder", "elbow", "tummy", "ankle", "back", "toe", "blood", "brain", "breast", "claf", "chin",
        "clavicle", "diaphragm", "eyelid", "face", "femur", "groin", "grum", "heart", "heel", "hip", "humerus", "jaw", "kidney", "larynx", "lip", "liver",
        "lobe", "lungs", "mandible", "muscle", "molar", "navel", "nerves", "organs", "palm", "phalanges", "pupil", "radius", "ribs", "scalp", "senses",
        "shoulder", "skin", "skull", "sole", "spine", "stomach", "sternum", "teeth", "throat", "tibia", "waist", "wrist"];
    public lastNames: string[] = [];
});

class NPC implements NPCInterface
{
    public Name: string;
    public Dialogs: Dialog[];
    public Look: string;
    public ShopItems: ShopItem[];

    public static GenerateName(firstNameOnly: boolean = false): string
    {
        if (firstNameOnly)
            return npcNames.firstNames[Math.round(Math.random() * (npcNames.firstNames.length - 1))];
        return npcNames.firstNames[Math.round(Math.random() * (npcNames.firstNames.length - 1))] + " " +
            npcNames.firstPart[Math.round(Math.random() * (npcNames.firstPart.length - 1))] +
            npcNames.middlePart[Math.round(Math.random() * (npcNames.middlePart.length - 1))];
    }

    public static Generate(): NPC
    {
        var npc = new NPC();
        var dialog = new Dialog();
        dialog.Text = "Hi @name@!\n\nWhat can I do for you today?";
        npc.Dialogs = [dialog];
        var answer = new Answer();
        answer.Text = "Nothing thanks.";
        dialog.Answers = [answer];
        npc.Name = NPC.GenerateName();
        for (var n in world.art.characters)
        {
            npc.Look = n;
            break;
        }
        return npc;
    }
}