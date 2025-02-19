const DoubleController = {
    async createDouble(req, res){
        try {
            res.status(201).json({message: "Double created successfully"});
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    }
}

export default DoubleController;