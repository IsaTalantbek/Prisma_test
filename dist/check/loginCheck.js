const checkLogin = async (login) => {
    // Проверка типа данных для login (строка)
    if (typeof login !== 'string') {
        return false;
    }
    // Убираем все пробелы
    login = login.replace(/\s+/g, '');
    // Регулярное выражение для проверки:
    // допускаются латинские буквы, цифры, и символы _, -, /, #
    // Логин должен быть длиной от 3 до 20 символов
    const regex = /^[A-Za-z0-9_\-/#]{3,20}$/;
    if (!regex.test(login)) {
        return false;
    }
    return true;
};
export default checkLogin;
