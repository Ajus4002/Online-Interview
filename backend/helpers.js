const Response = {
    error(message) {
        return{ status: "error", message }
    },

    success(data) {
        return{ status: "success", data }
    }
}

module.exports = { Response }
