const checkGender = async (gender) => {
    if (typeof gender !== 'string') {
        return false;
    }
    const validGenders = ['man', 'woman', 'undefined'];
    if (!validGenders.includes(gender)) {
        return false;
    }
    return true;
};
export default checkGender;
