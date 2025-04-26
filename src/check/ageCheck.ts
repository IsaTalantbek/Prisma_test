const checkAge = async (age: any) => {
    if (typeof age !== "number") {
        return false;
    }

    // Проверка возраста, должен быть от 1 до 120 лет
    if (age < 1 || age > 120) {
        return false;
    }
    return true;
};

export default checkAge;
