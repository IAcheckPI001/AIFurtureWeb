



function validatePassword(passkey, minLength = 8, allowedSpecials = "#.,!@#$%^&*()_+-=[]{};':\"|,.<>?/") {
    const hasUpper = /[A-Z]/.test(passkey);
    const hasLower = /[a-z]/.test(passkey);
    const hasDigit = /[0-9]/.test(passkey);

    const specialsEscaped = allowedSpecials.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const specialRegex = new RegExp("[" + specialsEscaped + "]");
    const hasSpecial = specialRegex.test(passkey);

    const lengthOk = passkey.length >= minLength;

    if (hasUpper, hasLower, hasDigit, hasSpecial, lengthOk){
        return true
    }

    return false
}

