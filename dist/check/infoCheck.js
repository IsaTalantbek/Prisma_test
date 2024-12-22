const checkInfo = async (info) => {
    // Проверка типа данных для информации (строка)
    if (typeof info !== 'string') {
        return false;
    }
    // Максимум 250 символов
    if (info.length > 250) {
        return false;
    }
    return true;
};
export default checkInfo;
