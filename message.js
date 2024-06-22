var provider = new firebase.auth.GoogleAuthProvider();

const config = {
    // Insert config information
};

firebase.initializeApp(config);
var database = firebase.database();

firebase.auth().onAuthStateChanged(function(user){
    if (user == null) {
        var provider = new firebase.auth.GoogleAuthProvider();
          firebase.auth().signInWithRedirect(provider).then(function(result) { 
        window.location.replace("fbtest.html");
    });
    return;
    } else {
        userEmail = user.email;
        userName = user.displayName;
    } 
    counter = 0
    for (var i = 0; i<userEmail.length; i++){
        if(userEmail[i]=="."){
            counter = counter + 1
        }
    }

    queryString = decodeURIComponent(window.location.search);
    queryString = queryString.substring(1);

    var database = firebase.database();
    var ref = database.ref('Clubs/'+queryString+"/Members")
    ref.on('value', checkHeads)
});

function signout(){
    firebase.auth().signOut()
}

function checkHeads(data){
    var user = firebase.auth().currentUser;
    var memberData = data.val();
    var keys = Object.keys(memberData);
    var head = false
    for (var i = 0; i < keys.length; i++){
        var k = keys[i];
        if(user.email == memberData[k].email){
            if(memberData[k].role === "head"){
                var head = true;
            }
        }
    }
    if (userEmail.includes("@ucc.on.ca")){
        if(counter != 2 && !head){
            document.getElementById("uid").innerHTML = userName;
            document.getElementById("mainPage").style.display = "block";
            document.getElementById('message').style.display = "none"
            console.log("Not Head")
            info()
        } else{
            document.getElementById("uid").innerHTML = userName;
            document.getElementById("mainPage").style.display = "block";
            console.log("Is Head")
            info()
        }
    } else{
        errorpage = document.getElementById("errorpage")
        errorpage.style.display = "block";
    }
}

function info(){
    document.getElementById("title").prepend(document.createTextNode("Messages - " + queryString))
    var ref = database.ref('Clubs/'+queryString+"/Messages")
    ref.on('value', displayMessages)
}

function leave(){
    var user = firebase.auth().currentUser;
    queryString = decodeURIComponent(window.location.search);
    queryString = queryString.substring(1);
    var ref = database.ref('Clubs/'+queryString+"/Members");
    ref.on('value', left)
}

function left(data){
    var user = firebase.auth().currentUser;
    var memberData = data.val(); 
    var keys = Object.keys(memberData);
    queryString = decodeURIComponent(window.location.search);
    queryString = queryString.substring(1);
    for (var i = 0; i < keys.length; i++){
        var k = keys[i];
        if(user.email == memberData[k].email){
            var ref = database.ref('Clubs/'+queryString+"/Members/"+k)
            ref.remove()
        }
    }
    window.location.href = "mainPage.html";
}

function modal(){
    if(document.getElementById("modal1").style.display == "block"){
        document.getElementById("modal1").style.display = "none"
    }
    else{
        document.getElementById("modal1").style.display = "block"
    }
}

function addMessage(){
    var clubName = decodeURIComponent(window.location.search).substring(1);
    var ref = database.ref('Clubs/'+clubName+"/Messages")
    var message = document.getElementById("messageContent").value
    var day = new Date().getDate()
    var month = new Date().getMonth()+1
    var year = new Date().getFullYear()
    var date = month + "/" + day + "/" + year
    var name = document.getElementById("uid").innerHTML
    var data = {
        message: message,
        date: date,
        name: name
    }
    ref.push(data);
    modal()
}

function displayMessages(data){
    document.getElementById("messages").innerHTML = ""
    var clubData = data.val(); 
    var keys = Object.keys(clubData);
    for (i = 0; i < keys.length; i++) {
        var k = keys[i]
        var username = clubData[k].name;
        var message = clubData[k].message;
        var date = clubData[k].date;

        var msgBox = document.createElement("div")
        msgBox.className = "message hoverable"

        var msgHead = document.createElement("div")
        msgHead.className = "messageHead"
        msgHead.appendChild(document.createTextNode(username))

        var msgContent = document.createElement("div")
        msgContent.className = "messageContent"
        msgContent.appendChild(document.createTextNode(message))

        var msgDate = document.createElement("div")
        msgDate.className = "messageDate"
        msgDate.appendChild(document.createTextNode(date))

        msgBox.appendChild(msgHead)
        msgBox.appendChild(msgContent)
        msgBox.appendChild(msgDate)

        document.getElementById("messages").appendChild(msgBox)
    }
}