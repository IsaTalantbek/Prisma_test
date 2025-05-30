const checkPassword = async (password: any) => {
    // Пароль минимум 8 символов, минимум 1 заглавная буква
    if (password.length < 8) {
        return false;
    }
    if (password.length > 50) {
        return false;
    }
    if (!/[A-Z]/.test(password)) {
        return false;
    }
    return true;
};

export default checkPassword;
