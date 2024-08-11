const { ManagerModel } = require('../index');
const code = require('../../../utils/httpStatus');

class Manager {

    constructor(data) {
        this.name_ar = data.name_ar;
        this.name_en = data.name_en;
        this.user = data.user;
        this.password = data.password;
        this.phone = data.phone;
    }

    async register() {
        try {
            const manager = await ManagerModel.create(this);
            return {
                data: manager,
                status: code.CREATED
            };
        } catch (error) {
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }

    static async login(user, password) {
        try {
            const manager = await ManagerModel.findOne({
                where: {
                    user: user
                }
            });
            if (!manager) {
                return {
                    data: 'User Not Found',
                    status: code.NOT_FOUND
                }
            } else if (password !== manager.password) {
                return {
                    data: 'Invalid password',
                    status: code.NOT_FOUND
                }
            } else {
                return {
                    data: {
                        token: manager.generateToken(),
                        data: manager
                    },
                    status: code.OK
                }
            }
        } catch (error) {
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }
    
}

module.exports = Manager;