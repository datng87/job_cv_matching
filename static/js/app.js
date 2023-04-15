var result_json = JSON.parse('{"name":"John", "age":30, "city":"New York"}');
var mystatus = false;
var job_skills = [];
var cv_skills = [];
var skill_list = [];

//load job file
function loadjobAsText() {
  var fileToLoad = document.getElementById("jobToLoad").files[0];

  var fileReader = new FileReader();
  fileReader.onload = function (fileLoadedEvent) {
    var textFromFileLoaded = fileLoadedEvent.target.result;
    document.getElementById("job_desc").value = textFromFileLoaded;
  };
  fileReader.readAsText(fileToLoad, "UTF-8");
};

//load resume file
function loadresumeAsText() {
  var fileToLoad = document.getElementById("resumeToLoad").files[0];

  var fileReader = new FileReader();
  fileReader.onload = function (fileLoadedEvent) {
    var textFromFileLoaded = fileLoadedEvent.target.result;
    document.getElementById("resume").value = textFromFileLoaded;
  };
  fileReader.readAsText(fileToLoad, "UTF-8");
};

//submit
function submit_data() {
  var cv = document.getElementById("resume").value;
  var job = document.getElementById("job_desc").value;
  // replace linebreak by space, remove special character except space
  job = job.replace(/\n/g, " ");
  job = job.replace(/[^a-zA-Z0-9 ]/g, "");
  cv = cv.replace(/\n/g, " ");
  cv = cv.replace(/[^a-zA-Z0-9 ]/g, "");
  //call lightcast API

  //next version: check if current token is healthy -- host a config file somewhere else and call to get data -> after that update token if needed

  //get token
  url = "https://auth.emsicloud.com/connect/token";
  var payload = "client_id=" + client_id + "&client_secret=" + client_secret + "&grant_type=" + grant_type + "&scope=" + scope;
  d3.text(url, {
    method: "POST",
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: payload
  }).then((result)=> {
    //need to add check response is ok and catch error here
    result_json = JSON.parse(result);
    token = result_json.access_token;
    //get job skills
    return get_skills(job)
  }).then((result)=> {
    job_skills = result;
    console.log('job skill')
    console.log(job_skills);
    //get cv skills
    return get_skills(cv);
  }).then((result)=> {
    cv_skills = result;
    console.log('cv skill')
    console.log(cv_skills);
    //call chatgptapi
    
  }).catch((error)=> {
    console.log (error);
  });
  
  //display result

  // document.getElementById("result").value = job + cv;
};

//get skills function
function get_skills(document) {
  url = "https://emsiservices.com/skills/versions/latest/extract";
  var skill_header = ("Bearer " + token);
  myload = '{"text": "' + document + '", "confidenceThreshold": 0.85}';
  return new Promise((resolve, reject) => {
    d3.text(url, {
      method: "POST",
      headers: { "Authorization": skill_header, "Content-Type": "application/json" },
      body: myload,
      params: { "language": "en" }
    }).then((result) => {
      result_json = JSON.parse(result);
      skill_list = [];
      result_json.data.forEach((item) => {
        skill_list.push(item.skill.name);
      });
      myreturn = skill_list;
      resolve (myreturn);
    }).catch(function(error) {
      reject (error);
    });
  });
};
