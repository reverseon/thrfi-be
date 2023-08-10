
interface ValidatorResponse {
    valid: boolean;
    reason?: string;
}



let URLValidator = (url: string): ValidatorResponse => {
    if (url.length === 0) {
        return {
            valid: false,
            reason: 'URL is empty',
        }
    } else if (url.length > 2048) {
        return {
            valid: false,
            reason: 'URL is too long',
        }
    }
    let regex = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    if (!regex.test(url)) {
        return {
            valid: false,
            reason: 'URL is invalid',
        }
    }
    return {
        valid: true,
    }
}

let passwordValidator = (password: string): ValidatorResponse => {
    if (password.length < 8 || password.length > 64) {
        return {
            valid: false,
            reason: 'Password must be between 8 and 64 characters',
        }
    } else if (!password.match(/^[0-9a-zA-Z]+$/)) {
        return {
            valid: false,
            reason: 'Password must be alphanumeric',
        }
    }
    return {
        valid: true,
    }
}

let backhalfValidator = (backhalf: string): ValidatorResponse => {
    if (backhalf.length < 3 || backhalf.length > 64) {
        return {
            valid: false,
            reason: 'Backhalf must be between 3 and 64 characters',
        }
    } else if (!backhalf.match(/^[0-9a-zA-Z-]+$/)) {
        return {
            valid: false,
            reason: 'Backhalf must be alphanumeric or hyphenated',
        }
    }
    return {
        valid: true,
    }
}

export {
    URLValidator,
    passwordValidator,
    backhalfValidator,
}