///<reference path="../app.ts" />

function HashPassword(user: string, password: string): string
{
    return md5(packageJson.config.fixedHashSalt + "-" + user.toLowerCase() + "-" + password.toLowerCase());
}