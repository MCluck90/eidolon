var core = require('./eidolon/core.js'),
    Job = require('./eidolon/job.js');

module.exports.createJob = function(options) {
    return new Job(options);
};

module.exports.Job = Job;