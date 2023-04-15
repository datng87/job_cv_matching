//
var result_json = JSON.parse('{"name":"John", "age":30, "city":"New York"}');
var mystatus = false;
var job_skills = [];
var cv_skills = [];
var skill_list = [];
//load job file
function loadjobAsText(){
  var fileToLoad = document.getElementById("jobToLoad").files[0];

  var fileReader = new FileReader();
  fileReader.onload = function(fileLoadedEvent){
      var textFromFileLoaded = fileLoadedEvent.target.result;
      document.getElementById("job_desc").value = textFromFileLoaded;
  };
  fileReader.readAsText(fileToLoad, "UTF-8");
};
//load resume file
function loadresumeAsText(){
  var fileToLoad = document.getElementById("resumeToLoad").files[0];

  var fileReader = new FileReader();
  fileReader.onload = function(fileLoadedEvent){
      var textFromFileLoaded = fileLoadedEvent.target.result;
      document.getElementById("resume").value = textFromFileLoaded;
  };
  fileReader.readAsText(fileToLoad, "UTF-8");
};

//submit
function submit_data(){
  var cv = document.getElementById("resume").value;
  var job = document.getElementById("job_desc").value;
  // replace linebreak by space, remove special character except space
  job = job.replace(/\n/g, " ");
  job= job.replace(/[^a-zA-Z0-9 ]/g, "");
  cv = cv.replace(/\n/g, " ");
  cv = cv.replace(/[^a-zA-Z0-9 ]/g, "");
  //call lightcast API

  //next version: check if current token is healthy -- host a config file somewhere else and call to get data -> after that update token if needed
  var url = "https://emsiservices.com/skills/status";
  var myheaders =  ("Bearer "+ token);
  console.log(myheaders);
  d3.text(url,{
    method: "GET",
    headers: {'Authorization': myheaders }
  }).then((result)=>{
    result_json=JSON.parse(result);
    mystatus = result_json.data.healthy;
    console.log(mystatus);
    if (mystatus!=true) {
      //if token not healthy get new token
        url = "https://auth.emsicloud.com/connect/token";
        var payload = "client_id=" + client_id + "&client_secret=" + client_secret + "&grant_type=" + grant_type + "&scope=" + scope;
        d3.text(url,{
          method: "POST",
          headers: {'Content-Type': 'application/x-www-form-urlencoded' },
          body: payload
        }).then((result)=>{
          result_json=JSON.parse(result);
          token = result_json.access_token;
          //get job skill
          job_skills = get_skills(job);
          console.log('test1');
          console.log(skill_list);
          cv_skills = get_skills(cv);
          console.log('test2');
          console.log(skill_list);

          console.log('result new token');
          console.log(job_skills);
          console.log(cv_skills);
          
        });
      }
      else{
        //get job skill
        get_skills(job).then((result)=>{
          job_skills = result;
        });
        console.log('test1');
        console.log(skill_list);
        cv_skills = get_skills(cv);
        console.log('test2');
        console.log(skill_list);
        console.log('result old token');
        console.log(job_skills);
        console.log(cv_skills);
      };
    // console.log(token);
  });
  
  //get job skill

  //get resume skill

  //call chatgptapi

  //display result

  // document.getElementById("result").value = job + cv;
};

function get_skills (document) {
  url = "https://emsiservices.com/skills/versions/latest/extract";
  var skill_header = ("Bearer "+ token);
  myload = '{"text": "' +  document + '", "confidenceThreshold": 0.85}';
  // console.log(myload)

  return new Promise((myreturn)=>{
    d3.text(url,{
      method: "POST",
      headers: {"Authorization": skill_header, "Content-Type": "application/json" },
      body:  myload,
      params: {"language":"en"}
    }).then((result)=>{
      result_json=JSON.parse(result);
      skill_list = [];
      result_json.data.forEach((item)=>{
        skill_list.push(item.skill.name);
      });
      console.log (skill_list);
      myreturn = skill_list;
    });
  });
};
