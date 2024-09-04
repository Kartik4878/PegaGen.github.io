// Configs

// const baseUrl = "https://szk2j6ti.pegace.net/prweb/api/v1/";
const baseUrl = "https://cbaess-bimowf-dt1.privatelink.pegaservice.net/prweb/api/v1/"
const caseTypesUrl =  "casetypes";
const createCaseUrl = "cases";
const getAssignDetailsURL = "assignments/";
const dataAPIURL = "data/";
const applicationsURL = "applications/";
const nodesURL = "nodes/";



// Pages ===

// ******** Casetypes Page


const displayCaseTypes = async()=>{
    if(!document.getElementById("caseTypesContainer")){
    const {caseTypes, errors} = await(getData(caseTypesUrl));
    if(errors){
        handleErrors(errors);
        return;
    }
    if(caseTypes){
        const ul = document.createElement("ul");
        ul.setAttribute("class","flex content-center flex-wrap bg-gray-200 h-48 flex justify-center")
        caseTypes.forEach(element => {
            const li = document.createElement("li");
            li.appendChild(returnButton(1,element.name,()=>createCase(element)));
            ul.appendChild(li);
        });
        const caseTypesContainer = returnDiv("caseTypesContainer","",ul);
        reloadPageContent(caseTypesContainer);
        }
    }else{
        alert("Please select a case type.")
    }
}

const createCase = async (casetype)=>{
    if(!document.getElementById("caseContainer")){
            const {ID , nextAssignmentID, errors} = await postData(createCaseUrl, {caseTypeID : casetype.ID});
            if(errors){
                handleErrors(errors);
                return;
            }
            const caseTypesContainer = document.getElementById("caseTypesContainer");
            const caseContainer = document.createElement("section");
            caseContainer.setAttribute("id","caseContainer");
            caseContainer.setAttribute("class","bg-gray-100 m-4 p-4");
            const caseID = returnHeader(1,ID,"inline-block bg-gray-300");
            const caseIDContainer = returnDiv("caseIDContainer","text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl flex justify-center mt-3",caseID);
            caseContainer.appendChild(returnButton(1,"Perform Assignment",async()=>await setUpPerformAssignment(nextAssignmentID)));
            caseContainer.appendChild(caseIDContainer);
            caseTypesContainer.appendChild(caseContainer);
    }else{
        alert("Please click to get the assignment details.");
    }
}





//***** My cases page */


const displayMyCases = async()=>{
        const {cases, errors} = await getData(createCaseUrl);
        if(errors){
            handleErrors(errors);
            return;
        }
        const myCases = returnDiv("myCases","",returnTable(cases, getCaseInformation, "ID"));
        reloadPageContent(myCases); 
}

//******my Assignments page */

const displayMyAssignments = async()=>{
        const {assignments, errors} = await getData(getAssignDetailsURL);
        if(errors){
            handleErrors(errors);
            return;
        }
        const myAssignments = returnDiv("myAssignments","",returnTable(assignments, setUpPerformAssignment, "ID"));
        reloadPageContent(myAssignments);
}


//**Case Infromation page */

const getCaseInformation =async (id)=>{
    setupFunctionalities(true,displayMyCases);
        const {ID, content, assignments, errors} =await getData(createCaseUrl + "/" + id);
        if(errors){
            handleErrors(errors);
            return;
        }
        const bubble = document.createElement("span");
        bubble.setAttribute("class", "inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2");
        bubble.textContent = content.pxCreateOperator;
        const bubble2 = document.createElement("span");
        bubble2.textContent = content.pxCreateDateTime;
        bubble2.setAttribute("class", "inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2");
        const bubbleContainer = returnDiv("bubbleContainer","px-6 pt-4 pb-2",bubble);
        const innerCard2 = returnDiv("innerCaseCard2","font-bold text-xl mb-2",null);
        const innerCard = returnDiv("innerCaseCard","px-6 py-4",innerCard2);
        const card = returnDiv("caseCard","max-w-sm rounded overflow-hidden shadow-lg",innerCard);
        innerCard2.textContent = ID;
        innerCard2.appendChild(bubbleContainer);
        bubbleContainer.appendChild(bubble2);
        if(assignments){
            card.appendChild(returnButton(1,"Perform assignment",()=>setUpPerformAssignment(assignments[0].ID)));
        }
        reloadPageContent(card);
}


//**** Data page Page */
const returnDataPageContainer = ()=>{
    const input = returnInput(1,"dataPageName","Data Page name", "dataPageName","text","");
    const form = returnDiv("datapageForm","bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4",input);
    form.appendChild(returnButton(3,"Submit",async() => await returnDataPageDetailsForm(input.value)));
    const dataPageContainer = returnDiv("dataPageContainer","bg-gray-200",form);
    reloadPageContent(dataPageContainer);
}

const returnDataPageDetailsForm =async (DPName)=>{
    const dataPageContainer = document.getElementById("dataPageContainer");
    dataPageContainer.querySelector("#dataPageInfoBox")? dataPageContainer.removeChild(dataPageContainer.querySelector("#dataPageInfoBox")) : null;
    dataPageContainer.querySelector("#dataContainer") ? dataPageContainer.removeChild(dataPageContainer.querySelector("#dataContainer")) : null;
        const {structure, parameters, errors} = await getData(`${dataAPIURL}${DPName}/metadata`);
        if(errors){
            handleErrors(errors);
            return;
        }else{
        const h1 = returnHeader(1,`Type : ${structure}`,"");
        const dataPageInfoBox = returnDiv("dataPageInfoBox","bg-blue-200 shadow-md rounded px-8 pt-6 pb-8 mb-4",h1);
        if(parameters){
        const paramInputBoxContainer = returnDiv("paramForm","",null);
        parameters.forEach(param =>{
            const input = returnInput(1,param.name,param.name,param.name,"text","");
            paramInputBoxContainer.appendChild(input);
        })
        const paramForm = returnDiv("paramForm","bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4",paramInputBoxContainer);
        
        dataPageInfoBox.appendChild(paramForm);
    }
    const FinalSubmitButton = returnButton(3,"Submit",async()=>await returnDataPageContent(DPName,structure,dataPageInfoBox.querySelector("#paramForm")));
    dataPageInfoBox.appendChild(FinalSubmitButton);
    dataPageContainer.appendChild(dataPageInfoBox);
}
}

const returnDataPageContent = async (DPName,structure,paramForm)=>{
    const dataPageContainer = document.getElementById("dataPageContainer");
    dataPageContainer.querySelector("#dataContainer") ? dataPageContainer.removeChild(dataPageContainer.querySelector("#dataContainer")) : null;
    const dataContainer =  returnDiv("dataContainer", "",null);
    dataContainer.setAttribute("class","flex content-center flex-wrap bg-white flex justify-center");
    let queryString = null;
    if(paramForm){
        const params = returnFormData(paramForm);
        queryString = "?";
        Object.keys(params).forEach(key=>{
            const eachQuery = `${key}=${params[key]}`
            queryString+=`${eachQuery}&`;
        });
    }
    const finalUrl = queryString? `${dataAPIURL}${DPName}${queryString}`:`${dataAPIURL}${DPName}`;
    const data = await getData(finalUrl);
    if(data?.errors){
        handleErrors(data.errors);
        return;
    }
    if(structure === "list"){
        const {pxResults} = data;
        dataContainer.appendChild(returnTable(pxResults, null, null));
        dataPageContainer.appendChild(dataContainer);
    }else{
        const convertedData = Object.keys(data).map(key => {
            return { key: key, value: data[key] };
        });
        dataContainer.appendChild(returnTable(convertedData, null, null));
        dataPageContainer.appendChild(dataContainer);
    }
}

// Nodes Page
const displayAllNodes = async()=>{
        const {data} = await getData(nodesURL);
        const {result} = data;
        const allNodesCard = returnDiv("nodesInfo","rounded overflow-hidden shadow-lg",null);
        result.forEach(node =>{
            const nodeCard = returnDiv("","rounded overflow-hidden shadow-lg",null);
            node.cluster_members.forEach(member=>{
                nodeCard.appendChild(returnTable(convertObjectToArray(member),null,null));
                nodeCard.appendChild(returnButton(1,"Get node cofigs", async()=> await displayNodeConfigs(member.nodeId)));  
                nodeCard.appendChild(returnButton(2,"Clear Declarative rule cache", async()=> await handleClearCache(member.nodeId, "declarative_rule")));       
                nodeCard.appendChild(returnButton(2,"Clear rule cache", async()=> await handleClearCache(member.nodeId, "rule")));         
                nodeCard.appendChild(returnButton(2,"Clear Declare Page cache", async()=> await handleClearCache(member.nodeId, "declarative_page")));   
                nodeCard.appendChild(returnButton(1,"All Requestors", async()=> await displayAllRequestors(member.nodeId)));         
            })
            allNodesCard.appendChild(nodeCard);
        })
        reloadPageContent(allNodesCard);
    
}

const handleClearCache =async (nodeID, cacheType) =>{
        const {error} = await postData(`${nodesURL}${nodeID}/caches/${cacheType}/clear`,{});
        if(error){
            alert(error[0].errorMessage);
        }else{
            alert(cacheType === "rule" ? "Rule cache cleared." : cacheType==="declarative_page" ? "Declarative page cache cleared." : "Declarative rule cache cleared.");
        }
    } 

// Manage requestors page 
const displayAllRequestors = async(nodeID)=>{
    setupFunctionalities(true,displayAllNodes);
        const {data, errors} = await getData(`${nodesURL}${nodeID}/requestors`);
        if(errors){
            handleErrors(errors);
            return;
        }
        const {requestors} = data.result[0];
        const finalReq = requestors.map(req =>{
            req.reqKey = `${req.requestor_id}!${data.result[0].nodeId}`
            return req;
        })
        const allRequestors  = returnDiv("nodeSettings","",returnTable(finalReq, displayRequestorsInfo, "reqKey"))
        reloadPageContent(allRequestors);
    } 


const displayRequestorsInfo = async(key)=>{
    const [requestor_id,nodeId] = key.split('!');
    setupFunctionalities(true,()=>displayAllRequestors(nodeId));
        const {data, errors} = await getData(`${nodesURL}${nodeId}/requestors/${requestor_id}`);
        if(errors){
            handleErrors(errors);
            return;
        }
        const {requestor_details} = data.result[0];
        const opName = returnHeader(1,requestor_details.operator_name,"");
        const opID= returnHeader(1,requestor_details.operator_id,"");
        const reqID =returnHeader(1,requestor_details.requestor_id,"");
        const reqInfo  = returnDiv("reqInfo","rounded overflow-hidden shadow-lg",opName);
        reqInfo.appendChild(opID);
        reqInfo.appendChild(reqID);
        reqInfo.appendChild(returnButton(2,"Stop requestor",()=>handleStopRequestor(requestor_id,nodeId)));
        reloadPageContent(reqInfo);
    }


const handleStopRequestor=async(reqID, nodeID)=>{
        const {data, errors} = await deleteData(`${nodesURL}${nodeID}/requestors/${reqID}`);
        if(errors){
            handleErrors(errors);
            return;
        }
        alert("Requestor stopped");
        displayAllRequestors(nodeID);
    }


// Node Config settings page 

const displayNodeConfigs = async(nodeID)=>{
    setupFunctionalities(true,displayAllNodes);
        const {data, errors} = await getData(`${nodesURL}${nodeID}/settings/system`);
        if(errors){
            handleErrors(errors);
            return;
        }
        const {configurationSettings} = data.result[0];
        const nodeSettings  = returnDiv("nodeSettings","",returnTable(configurationSettings, null, null))
        reloadPageContent(nodeSettings);
    }

// Applications Page 
const displayMyApplications = async()=>{
        const {applications, errors} = await getData(applicationsURL);
        if(errors){
            handleErrors(errors);
            return;
        }
        const myApplications = document.createElement("section");
        myApplications.setAttribute("id","myCases");
        myApplications.appendChild(returnTable(applications, getApplicationInfo, "ID"));
        reloadPageContent(myApplications);
    } 

// Application Info page 
const getApplicationInfo =async (id)=>{
    setupFunctionalities(true,displayMyApplications);
        const {name, version, builtOnApplications, rulesets, errors} =await getData(applicationsURL +  id);
        if(errors){
            handleErrors(errors);
            return;
        }
        const appName = returnHeader(2,name,"m-1 underline font-bold text-center");
        const appVersion = returnHeader(3,version,"m-1 text-center");
        const card = returnDiv("applicationInfo","rounded overflow-hidden shadow-lg",null);
        card.appendChild(appName);
        card.appendChild(appVersion);
        if(builtOnApplications) card.appendChild(returnTable(builtOnApplications,getApplicationInfo,"name"));
        if(rulesets) card.appendChild(returnTable(rulesets,null,null));
        card.appendChild(returnButton(1, "Get Quality metrics", async() => await getMetricsInfo(id,"quality_metrics")));
        card.appendChild(returnButton(1, "Get Guardrail metrics", async() => await getMetricsInfo(id,"guardrail_metrics")));
        card.appendChild(returnButton(1, "Start app test coverage", async() => await manageTestCoverageRun(id, true)));
        card.appendChild(returnButton(2, "Stop app test coverage", async() => await manageTestCoverageRun(id, false)));
        card.appendChild(returnButton(1, "Get Test metrics", async() => await getMetricsInfo(id,"test_metrics")));
        reloadPageContent(card);
    } 

const manageTestCoverageRun = async(id, isStart) =>{
        const url = isStart ? "start_application_coverage" : "stop_application_coverage";
        const {status,errors} = await getData(`${applicationsURL}${id}/${url}`);
        if(errors){
            handleErrors(errors);
        }else{
            isStart ? alert("Test Coverage started") : alert("Test Coverage stopped");
        }
    } 

// Application Metrics Page

const getMetricsInfo = async(id, metricsType)=>{
    setupFunctionalities(true);
        const  {ApplicationStatistics, applicationsQuality, ApplicationGuardrails, errors} = await getData(`${applicationsURL}${id}/${metricsType}`);
        if(errors){
            handleErrors(errors);
            return;
        }
        const card = returnDiv("appQualityCard","rounded overflow-hidden shadow-lg", null);
        if(ApplicationStatistics){
            const {appName,applicationsIncluded, unitTestCompliance, unitTestExecution} = ApplicationStatistics[0];
            unitTestCompliance ? card.appendChild(returnTable(unitTestCompliance,null,null)) : null;
            unitTestExecution ? card.appendChild(returnTable(unitTestExecution,null,null)) : null;
        }else if(applicationsQuality){
            const {appName,guardrails, unitTesting, testCoverage} = applicationsQuality[0];
            guardrails ? card.appendChild(returnTable(convertObjectToArray(guardrails),null,null)) : null;
            unitTesting ? card.appendChild(returnTable(convertObjectToArray(unitTesting),null,null)) : null;
            testCoverage ? card.appendChild(returnTable(convertObjectToArray(testCoverage),null,null)) : null;
        }else if(ApplicationGuardrails){
            const {appName,Guardrails} = ApplicationGuardrails[0];
            Guardrails ? card.appendChild(returnTable(convertObjectToArray(Guardrails),null,null)) : null;
        }
        reloadPageContent(card);
    } 
//****** Assignment page

const returnActionContainer = async(assignID)=>{
    if(!document.getElementById("actionContainer")){
            const {actions} = await getData(getAssignDetailsURL + assignID);
            const actionContainer = returnDiv("actionContainer","flex content-center flex-wrap bg-gray-200 h-20 flex justify-left",null);
            actions.forEach(action=>{
            actionContainer.appendChild(returnButton(3,action.name,async()=>await performAssignment(assignID, action.ID)));
            });
            return actionContainer;
    }else{
    alert("Please select an action.");
}
}




const performAssignment = async(assignID, actionID)=>{    const content = document.getElementById("content");
    if(document.getElementById("assignForm")){
          content.removeChild(document.getElementById("assignForm"));
    }
            const data = await getData(getAssignDetailsURL + assignID + "/actions/" + actionID + "?flatListOfFields=Full");
            const form = returnDiv("assignForm","bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4",null);
            data.view.groups.forEach(inputField =>{
            form.appendChild(returnInput(1,inputField.field.fieldID,inputField.field.label,inputField.field.fieldID,"text",inputField.field.value));
            })
            form.appendChild(returnButton(1,"Submit",async()=>await submitAssignment(assignID, actionID,returnFormData(form))));
            content.appendChild(form);
         
}

const setUpPerformAssignment =async (assignID)=>{
    setupFunctionalities(true,displayMyAssignments);
    reloadPageContent(await returnActionContainer(assignID));
}


const submitAssignment =async (assignID, actionID,formData)=>{
    const data = {
        content : formData
    }
        const {errors, nextAssignmentID} = await postData(getAssignDetailsURL + assignID+  "?actionID=" + actionID, data);
        if(!errors){
        if(nextAssignmentID){
            setUpPerformAssignment(nextAssignmentID);
        }else{
        setupFunctionalities(false)
        alert("Submitted assignment - "+ assignID);
        }
        }else{
            if(errors[0].ValidationMessages.length >0){
            alert(errors[0].ValidationMessages[0].ValidationMessage);
            }else if(errors[0].message){
                alert(errors[0].message);
            }
        }
   
}

// Prompts page == 

const getPromptsPage = ()=>{
    setupFunctionalities(true, null);
    const input = returnInput(1,"prompt","Enter prompt here..", "prompt","text","");
    const form = returnDiv("promptForm","bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4",input);
    form.appendChild(returnButton(3,"Submit",()=>handlePromptsRun(input.value)));
    const promptContainer = returnDiv("promptContainer","bg-gray-200",form);
    reloadPageContent(promptContainer);
}

const geminiURL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDiPEx_vXZiqhB33wIw5z-w25MrHAAE-rE";
const geminiText = "I have the following prompt in double quotes:\r\n\"I want to get information about CCNEC-32 case\"\r\nI don\'t need any explanations for the logic; I just want the final answer object to be returned as the response. I don\'t want you to work as a function to return the final answer object.\r\nBased on the prompt, I want to first determine whether I need to get a list of data objects or a single data object.\r\nI have written the logic as an if-else condition, and you need to solve it to return the final answer object as the response.\r\nIf the prompt is about a list of data objects:\r\n{\r\n  \"type\": \"list\",\r\n  \"dataFor\": \"\",\r\n  \"category\": \"\"\r\n}\r\nIf the prompt is about a list of cases:\r\n•\tSet the category of the final response object to \"case\".\r\n•\tAnalyse the type of case and store the answer in the dataFor key of the final response object.\r\n•\tThe type of case should be a single word and can be one of the following: Commsec, TradeFinance, EDA.\r\nIf the prompt is about a list of applications:\r\n•\tSet the category of the final response object to \"application\".\r\nIf the prompt is about a list of assignments:\r\n•\tSet the category of the final response object to \"assignment\".\r\nIf the prompt is about nodes or a list of nodes:\r\n•\tSet the category of the final response object to \"nodes\".\r\nOtherwise:\r\n{\r\n  \"type\": \"object\",\r\n  \"dataFor\": \"\",\r\n  \"category\": \"\"\r\n}\r\nIf the prompt is about getting information about a case:\r\n•\tAnalyse the prompt and set the case ID present in the prompt to the dataFor key of the final response object.\r\n•\tThe case ID will be in this format: \"ABCDE-3213\".\r\nIf the prompt is about getting information about an application:\r\n•\tAnalyse the prompt and set the application name present in the prompt to the dataFor key of the final response object.\r\n•\tThe application name can be one of the following: Commsec, TradeFinance, EDA.\r\n•\tSet the category of the final response object to \"application\".\r\n \r\n"
const gemeniData = {
    contents: [
        {
            parts: [
                {
                    "text": geminiText
                }
            ]
        }
    ]
}
const handlePromptsRun =async (prompt) =>{
    console.log(prompt);
    const {data} =await postData(geminiURL, gemeniData);
    console.log(data);
    // data = {
    //     type : "object",
    //     dataFor : "WORK-CHANNEL-TRIAGE ET-185021",
    //     category : "case"
    // }
    if(data.type === "object"){
    if(data.category === "case"){
        getCaseInformation(data.dataFor);
    }else if(data.category === "application"){
        getCaseInformation(data.dataFor);
    }
}else{
    if(data.category === "case"){
        displayMyCases();
    }else if(data.category === "application"){
        displayMyApplications();
    }else if(data.category === "nodes"){
        displayAllNodes();
    }
}
}

// handle errors 

const handleErrors = (errors)=>{
    let errString = "";
    if(errors?.length > 0){
        errors.forEach(error => {errString += error?.message + "  "})
    }
    alert(errString);

}



// APIs ---

const getData = async(url) =>{
    try {
    setLoading(true);
    const finalUrl = baseUrl + url;
    const data = await fetch(finalUrl,{headers : new Headers({
        "Authorization" : `Basic ${sessionStorage.getItem("cred")}}` 
    })});
    setLoading(false);
    const jsonData = await data.json();
    jsonData.status = data.status;
    handleDiagnostics(finalUrl, null, jsonData);
    return jsonData;
    } catch (error) {
        handleAPIErrors(error);
        setLoading(false);
        return error;
    }
}

const postData = async(url, body) =>{
    try {
    setLoading(true);
    const finalUrl = baseUrl + url;
    const data = await fetch(finalUrl,{headers : new Headers({
        "Authorization" : `Basic ${sessionStorage.getItem("cred")}` 
    }), method : "POST", body:JSON.stringify(body)});
    setLoading(false);
    const jsonData = await data.json();
    jsonData.status = data.status;
    handleDiagnostics(finalUrl, body, jsonData);
    return await jsonData;
    } catch (error) {
    handleAPIErrors(error);
    setLoading(false);
    return error;    
    }
}



const deleteData = async(url) =>{
    try {
    setLoading(true);
    const finalUrl = baseUrl + url;
    const data = await fetch(finalUrl,{headers : new Headers({
        "Authorization" : `Basic ${sessionStorage.getItem("cred")}` 
    }), method : "DELETE"});
    setLoading(false);
    const jsonData = await data.json();
    jsonData.status = data.status;
    handleDiagnostics(finalUrl,null, jsonData);
    return await jsonData;
    } catch (error) {
    handleAPIErrors(error);
    setLoading(false);
    return error;    
    }
}

const handleAPIErrors =(error) =>{
    console.log(error);
    if(error.status === 401){
        alert("Unauthenticated user.");
        handleLogout();
    }else if(error.status === 500){
        alert("Internal server error.")
    }else {
        alert("Something went wrong");
    }
}


// Authentication ---

const isLoggedIn = ()=>{
    if(sessionStorage.getItem("cred")){
        return true;
    }
    return false;
}

const handleLogout = ()=>{
    sessionStorage.removeItem("cred");
    location.reload();
}


const handleLogin =async ()=>{
    sessionStorage.removeItem("cred");
    const loginForm = document.getElementById("loginForm");
    const data = returnFormData(loginForm);
    const cred = btoa(`${data.username}:${data.password}`);
    try {
        setLoading(true);
    const data = await fetch(baseUrl + caseTypesUrl,{headers : new Headers({
        "Authorization" : `Basic ${cred}` 
    })});
    console.log(data);
    const jsonData = await data.json();
    console.log(jsonData.status);
    setLoading(false);
    sessionStorage.setItem("cred",cred);  
    location.reload();
    } catch (error) {
    setLoading(false);
    alert("Invalid username or password");
}
}

const returnLoginForm = ()=>{
    const form = returnDiv("loginForm","bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4",returnInput(1,"username","User name","username", "text",""));
    form.appendChild(returnInput(1,"password","Password","password","password",""));
    form.appendChild(returnButton(1,"Login",handleLogin));
    return form;
}




// Utils --

const returnButton = (type, label, action)=>{
    let newClass = null;
    switch(type){
        case 1 : newClass = "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded m-1"; break;
        case 2 : newClass = "bg-red-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded m-1"; break;
        case 3 : newClass = "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l m-1"; break;
    } 
    const button = document.createElement("button");
    button.innerText = label;
    button.setAttribute("class",newClass);
    button.setAttribute("type","button");
    button.addEventListener("click",action);
    return button;
}
const returnInput = (inputType, id, label, name, type, value)=>{
    let newClass = null;
    switch(inputType){
        case 1 : newClass = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline m-1"; break;
    } 
    const input = document.createElement("input");
    input.setAttribute("class",newClass);
    input.setAttribute("id",id);
    input.setAttribute("placeholder",label);
    input.setAttribute("name",name);
    input.setAttribute("type",type);
    input.value = value;
    return input;
}

const returnDiv = (id,className,child)=>{
    const div= document.createElement("div");
    div.setAttribute("class",className);
    div.setAttribute("id",id);
    if(child){
        div.appendChild(child);
    }
    return div;
}

const returnHeader = (type, text, className)=>{
    const header = document.createElement(`h${type}`);
    header.textContent = text;
    header.setAttribute("class",className);
    return header;
}

const returnTable =(allItems, rowFunction, param)=>{
    if(allItems.length>0){
    const table = document.createElement("table");
    table.setAttribute("class","table-auto");
    const header = document.createElement("thead");
    const mainrow = document.createElement("tr");
    const allKeys = Object.keys(allItems[0]);
    allKeys.forEach(key=>{
        const th = document.createElement("th");
        th.setAttribute("class","px-4 py-2");
        th.textContent = key;
        mainrow.appendChild(th);
    })
    header.appendChild(mainrow);
    const tBody = document.createElement("tbody");
    allItems.forEach(item =>{
        const tr = document.createElement("tr");
        rowFunction? tr.setAttribute("class","cursor-pointer") : null;
        allKeys.forEach(key=>{
            const td = document.createElement("td");
            td.setAttribute("class","border px-4 py-2");
            td.textContent = item[key];
            td.addEventListener("click",()=>rowFunction(item[param]));
            mainrow.appendChild(td);
            tr.appendChild(td);
        })
        tBody.appendChild(tr);
    })
    table.appendChild(header);
    table.appendChild(tBody);
    return table;
}else{
    alert("No content to display.");
}
}

const convertObjectToArray = (object)=>{
    const convertedData = Object.keys(object).map(key => {
        return { key: key, value: object[key] };
    });
    return convertedData;
}

const returnFormData = (form) =>{
    const allInputs = form.querySelectorAll("input")
    let request = {};
    allInputs.forEach(input=>{
        request[input.name] = input.value;
    })
    return request
}

const reloadPageContent = (element)=>{
    if(document.getElementById("content"))root.removeChild(document.getElementById("content"));
    const content = document.createElement("section");
    content.setAttribute("data-aos","zoom-in-up");
    content.setAttribute("id","content");
    content.appendChild(element);
    root.appendChild(content);
}


const setLoading = (param)=>{
    if(param){
    const loader =  returnDiv("loader","border border-gray-300 shadow rounded-md p-4 max-w-sm w-full mx-auto",returnDiv("inputBox1","animate-pulse flex space-x-4",returnDiv("inputBox2","rounded-full bg-gray-400 h-12 w-12",returnDiv("inputBox3","flex-1 space-y-4 py-1",returnDiv("inputBox4","h-4 bg-gray-400 rounded w-3/4",returnDiv("inputBox5","space-y-2",returnDiv("inputBox6","h-4 bg-gray-400 rounded",returnDiv("innerBox7","h-4 bg-gray-400 rounded w-5/6",null))))))));
    document.getElementById("content").appendChild(loader);}
    else{
    document.getElementById("content").removeChild(document.getElementById("loader"));  
    }
}


// init code
const root = document.getElementById("root");
var backActionList = [];
const allFunctions = [
    {
        id: "01",
        items : [
            {
                label :"Get case types",
                action : displayCaseTypes
            },
            {
                label : "Get all my cases",
                action : displayMyCases
            },
            {
                label : "Get all my assignments",
                action : displayMyAssignments
            },
            {
                label : "Run Datapage",
                action: returnDataPageContainer
            }
        ]
    },
    {
        id: "02",
        items : [
            {
                label : "Get All Applications",
                action : displayMyApplications
            }
        ]
    },
    {
        id: "03",
        items : [
            {
                label : "Get All Nodes",
                action : displayAllNodes
            }
        ]
    }
] 
const setupFunctionalities = (isBackAction, backAction) =>{
    if(isBackAction && backAction){
        backActionList.push(backAction);
        console.log(backActionList);
    }
    const handleAction = (action)=>{
        setupFunctionalities(true);
        action();
    }
    const handleBackAction = ()=>{
        console.log(backActionList);
        backActionList.length > 0 ? backActionList.pop()() : setupFunctionalities(false);
    }
    if(document.getElementById("functionalities")){
        root.removeChild(document.getElementById("functionalities"));
        root.removeChild(document.getElementById("content"));
    }
    const functionalities = returnDiv("functionalities","bg-gray-100 p-2",null);
    const content = returnDiv("content","",null);
    if(isBackAction){
        functionalities.appendChild(returnButton(1,"<",handleBackAction));
    }else{
        allFunctions.forEach(eachFunction =>{
            const box = returnDiv(eachFunction.id,"flex content-center flex justify-center","");
            eachFunction.items.forEach(eachItem =>{
                box.appendChild(returnButton(1,eachItem.label, ()=>handleAction(eachItem.action)));
            })
            functionalities.appendChild(box);
        })
    }
    root.appendChild(functionalities);
    root.appendChild(content);
}




const handleDiagnosticsSwitch = ()=>{
    const nerdSwitch = localStorage.getItem("diagnosticSwitch");
    if(nerdSwitch==="true"){
    localStorage.setItem("diagnosticSwitch","false");
    const diagnosticBox = document.getElementById("diagnosticBox");
    if(diagnosticBox){
        document.body.removeChild(diagnosticBox);
    }
    }else{
        const h1 = returnHeader(1, "Diagnostics enabled","m-1 underline font-bold text-center");
        const diagnosticBox = returnDiv("diagnosticBox","bg-yellow-300 p-4 m-2",null);
        diagnosticBox.appendChild(h1);
        document.body.appendChild(diagnosticBox);
        localStorage.setItem("diagnosticSwitch","true");
    }
}

const handleDiagnostics =(url, request, response)=>{
    const nerdSwitch = localStorage.getItem("diagnosticSwitch");
    if(nerdSwitch==="true"){
    const diagnosticBox = document.getElementById("diagnosticBox");
     diagnosticBox.querySelector("#diagnostiContentBox") ? diagnosticBox.removeChild(diagnosticBox.querySelector("#diagnostiContentBox")) : null;
     const contentBox = returnDiv("diagnostiContentBox","","");
     contentBox.setAttribute("data-aos","flip-down");
     const urlbox = document.createElement("h1");
     urlbox.setAttribute("class","bg-red-400 p-2 m-1 rounded-md")
     urlbox.textContent = `URL: ${url}`;
     contentBox.appendChild(urlbox);
     if(request){
        const requestBox = document.createElement("p");
        requestBox.setAttribute("class","bg-blue-100 p-2 m-1 rounded-md");
        const requestContent = JSON.stringify(request,null,4);
        requestBox.textContent = `Request: ${requestContent}`
        contentBox.appendChild(requestBox);
     }
     if(response){
        const responseBox = document.createElement("p");
        responseBox.setAttribute("class","bg-gray-300 p-2 m-1 rounded-md");
        const responseContent = JSON.stringify(response,null,4);
        responseBox.textContent = `Response : ${responseContent}`
        contentBox.appendChild(responseBox);
     }
     diagnosticBox.appendChild(contentBox);
    }
}


const initiate = () =>{
    if(isLoggedIn()){
    localStorage.setItem("diagnosticSwitch","false");
    setupFunctionalities(false);
    const navCont = document.getElementById("nav-cont");
    navCont.appendChild(returnButton(2,"Logout",handleLogout));
    navCont.appendChild(returnButton(1,"Use Promts",getPromptsPage));
    navCont.appendChild(returnButton(3,"Diagnostics",handleDiagnosticsSwitch));
    }else{
        reloadPageContent(returnLoginForm());
    }
}

initiate();
AOS.init();

