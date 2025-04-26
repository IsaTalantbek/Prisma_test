const checkGender = async (gender: any) => {
    if (typeof gender !== "string") {
        return false;
    }

    const validGenders: string[] = ["man", "woman", "undefined"];
    if (!validGenders.includes(gender)) {
        return false;
    }
    return true;
};

export default checkGender;
