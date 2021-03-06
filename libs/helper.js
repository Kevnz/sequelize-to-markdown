'use strict'

const fs = require('fs');
const pathJs = require('path');

module.exports.filterBlacklist = function(toBeFiltered, blacklist)
{
    return toBeFiltered.filter(item =>
    {
        for(var i in blacklist)
            if(item.indexOf(blacklist[i]) !== -1)
                return false;

        return true;
    });
}

module.exports.listFiles = function(path, recursive, fileFilter, dirFilter)
{
    var results = [ ];

    if(Array.isArray(path))
    {
        var self = this;
        path.forEach(localPath => results = results.concat(self.listFiles(localPath, recursive, fileFilter, dirFilter)));
    }
    else
    {
        var fullPath = pathJs.resolve(path);
        var stats = fs.existsSync(fullPath) && fs.statSync(fullPath);

        if(stats && stats.isFile())
        {
            if(!fileFilter || fileFilter.test(fullPath))
                results.push(fullPath);
        }
        else if(stats && stats.isDirectory())
        {
            if(recursive)
            {
                fs.readdirSync(fullPath)
                    .map(item => pathJs.join(fullPath, item))
                    .filter(item => !dirFilter || dirFilter.test(item))
                    .map(item => this.listFiles(item, recursive, fileFilter, dirFilter)
                    .forEach(item => results.push(item)));
            }
            else
            {
                results = fs.readdirSync(fullPath)
                    .map(item => pathJs.join(fullPath, item))
                    .filter(item => !dirFilter || dirFilter.test(item));
            }
        }
        else if(!stats)
        {
            throw new Error('Path does not exist: ' + fullPath);
        }
    }

    return results;
}
