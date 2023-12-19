/**
 一些jarvis的中繼器
 */


/**
 * @description 確認權限, 全部都要達成
 */
module.exports.checkPermission = (permissions) => (req, res, next) => {
    const oritoken = req.headers['authorization'].replace('Bearer ', '');
    req.jarvis.checkPermission(permissions, oritoken)
        .then(p => {
            const error = [];
            permissions.forEach(ps => {
                if (!p[ps]) error.push(ps);
            });
            if (error.length > 0) return res.status(401).json({code: 401, message: `'${error.join(',')}' permission must required`});
            next();
        }).catch(err => {
            console.log(err);
            return res.status(err.code ? err.code : 500).json(err);
        });
}


/**
 * @description 確認權限, 其中一個達成就可以
 */
module.exports.checkPermissionOR = (permissions) => (req, res, next) => {
    const oritoken = req.headers['authorization'].replace('Bearer ', '');
    req.jarvis.checkPermission(permissions, oritoken)
        .then(p => {
            const error = [];
            permissions.forEach(ps => {
                if (!p[ps]) error.push(ps);
            });
            if (error.length < permissions.length) return next();
            return res.status(401).json({code: 401, message: `'${error.join(',')}' permission must aleast one`});
        }).catch(err => {
            console.log(err);
            return res.status(err.code ? err.code : 500).json(err);
        });
}

/**
 * @description 從 jarvis 取得使用者
 */
module.exports.findUser = (req, res, next) => {
    var uid = req.body.user || req.params.uid;
        uid = uid || req.query.uid;
    if (!uid) return res.status(500).json({code: 500, message: 'body.user or params.uid is required!'})
    req.jarvis.getUserById(uid)
        .then(user => {
            res.locals.user = user;
            next();
        }).catch(err => res.status(err.code ? err.code : 500).json(err));
}


module.exports.findUserByField = (field) => (req, res, next) => {
    var uid = req.body[field];
    if (!uid) return res.status(500).json({code: 500, message: `body.user or params.uid or 'body ${field}'  is required!`})
    req.jarvis.getUserById(uid)
        .then(user => {
            res.locals.user = user;
            next();
        }).catch(err => res.status(err.code ? err.code : 500).json(err));
}


module.exports.findUserByToken = (req, res, next) => {
    const oritoken = req.headers['authorization'].replace('Bearer ', '');
    req.jarvis.me(oritoken)
        .then(r => {
            res.locals.token_user = r;
            return next();
        }).catch(err => res.status(err.code ? err.code : 500).json({code: 500, err: JSON.stringify(err)}));
}
