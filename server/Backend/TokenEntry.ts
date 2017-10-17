interface TokenEntry
{
    [s: string]: TokenInformation;
}

interface TokenInformation
{
    id: number;
    lastUsage: Date;
    user: string;
    ip: string;
}