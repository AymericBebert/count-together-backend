export const generateToken = (length: number): string => {
    let res = '';
    const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        res += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return res;
};
