document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('select');
    var options = document.querySelectorAll('option');
    var instances = M.FormSelect.init(elems, options);
});

document.addEventListener('DOMContentLoaded', function () {
    var textNeedCount = document.querySelectorAll('#description');
    M.CharacterCounter.init(textNeedCount);
});

var cur_club = []
var cur_description = []
var cur_topics = []
var cur_img = []
var provider = new firebase.auth.GoogleAuthProvider();

const config = {
    // Insert config information
};

firebase.initializeApp(config);

var database = firebase.database();

firebase.auth().onAuthStateChanged(function(user) {
    if (user == null) {
        provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider)
        return;
    } else {
        userEmail = user.email;
        userName = user.displayName;
    } 
    counter = 0
    for (var i = 0; i<userEmail.length; i++) {
        if (userEmail[i]==".") {
            counter = counter + 1
        }
    }
    if (userEmail.includes("@ucc.on.ca")) {
        if (counter != 2) {
            document.getElementById("uid").innerHTML = userName;
            document.getElementById("mainPage").style.display = "block"
            document.getElementById('addclub').style.display = "none"
            getClubs()
        } else {
            document.getElementById("uid").innerHTML = userName;
            document.getElementById("mainPage").style.display = "block"
            getClubs()
        }
    } else {
        errorpage = document.getElementById("errorpage")
        errorpage.style.display = "block";
    }
});

function signout() {
    firebase.auth().signOut()
}

function getClubs() {
    var ref = database.ref('Clubs')
    ref.on('value', gotJoined)
}

function gotJoined(data) {
    var clubData = data.val(); 
    var keys = Object.keys(clubData);
    document.getElementById("myclubs").innerHTML = ""
    document.getElementById("allclubs").innerHTML = ""
    for (var i = 0; i < keys.length; i++){
        var k = keys[i];
        var ref = database.ref("Clubs/"+k)
        ref.on('value', getInfo)
        var ref = database.ref("Clubs/"+k+"/Members")
        ref.on('value', showJoined)
        cur_club = []
        cur_description = []
        cur_topics = []
        cur_img = []
    }
}

function getInfo(data) {
    var clubData = data.val(); 
    var keys = Object.keys(clubData);
    var k = keys[0];
    var name = clubData[k].name;
    var description = clubData[k].description;
    var topics = clubData[k].topics;
    for (var i=0; i<topics.length; i++){
        cur_topics.push(topics[i])
    }
    var img = clubData[k].image;
    cur_club.push(name)
    cur_description.push(description)
    cur_img.push(img)
}

function showJoined(data) {
    var user = firebase.auth().currentUser;
    var memberData = data.val(); 
    var keys = Object.keys(memberData);

    var outerCard = document.createElement("div")
    outerCard.className = "col s12 m7 cards"

    var innerCard = document.createElement("div")
    innerCard.className = "card hoverable"

    var clubImg = document.createElement("div")
    clubImg.className = "card-image"

    var img = document.createElement("img")
    img.src = cur_img[0]
    img.height = "125"
    img.style = "object-fit: cover"

    var clubContent = document.createElement("div")
    clubContent.className = "card-content"

    var clubName = document.createElement("span")
    clubName.className = "card-title"
    clubName.appendChild(document.createTextNode(cur_club[0]))

    var descriptiontext = document.createElement("p")
    descriptiontext.className = "description"
    descriptiontext.appendChild(document.createTextNode(cur_description[0]))

    var btn = document.createElement("div")
    btn.className = "card-action"

    var msgs = document.createElement("a")
    msgs.className = "button1 waves-effect waves-light btn-flat"
    msgs.style.color = "#5193d5"
    msgs.style.margin = "0px"
    msgs.style.padding = "0 15px"
    msgs.href = "messagePage.html?" + cur_club[0]
    msgs.id = cur_club[0]

    outerCard.appendChild(innerCard)
    innerCard.appendChild(clubImg)
    innerCard.appendChild(clubContent)
    clubImg.appendChild(img)
    clubContent.appendChild(clubName)
    clubContent.appendChild(descriptiontext)

    var topicDiv = document.createElement("div")
    topicDiv.className = "topicDiv"

    for(var i=0; i<cur_topics.length; i++){
        var topic = document.createElement("div")
        topic.className = "chip"
        topic.appendChild(document.createTextNode(cur_topics[i]))

        var dot = document.createElement("div")
        dot.className = "topic " + cur_topics[i] + " dot"

        topic.appendChild(dot)
        topicDiv.appendChild(topic)
        innerCard.appendChild(topicDiv)
    }

    innerCard.appendChild(btn)

    memberCheck = false

    for (var a = 0; a < keys.length; a++) {
        var k = keys[a];
        if(user.email === memberData[k].email){
            memberCheck = true
        }
    }

    if (memberCheck) {
        msgs.innerHTML = "OPEN"
        btn.appendChild(msgs)
        document.getElementById("myclubs").appendChild(outerCard)
    } else {
        msgs.innerHTML = "JOIN"
        msgs.addEventListener("click", join, false)

        btn.appendChild(msgs)
        document.getElementById("allclubs").appendChild(outerCard)
    }
}

function modal() {
    if (document.getElementById("modal1").style.display == "block") {
        document.getElementById("modal1").style.display = "none"
    }
    else {
        document.getElementById("modal1").style.display = "block"
    }
}

function addClub() {
    var clubName = document.getElementById("club").value;
    var clubDescription = document.getElementById("description").value;
    var clubTopics = document.getElementById("topics");
    var clubImg = document.getElementById("image").value;
    var clubHeads = document.getElementById("leaders").value;
    topiccheck = false
    for (var i = 0; i<clubTopics.options.length; i++){
        if(clubTopics.options[i].selected){
            topiccheck = true
        }
    }
    if (clubName === "" || clubDescription === "" || !topiccheck || clubImg === "" || clubHeads === "") {
        alert("Error! Please fill out all fields!")
    } else{
        emails = clubHeads.split(" ")
        topics = []
        for(var j=0; j<clubTopics.options.length; j++){
            if(clubTopics.options[j].selected){
                topics.push(clubTopics.options[j].value)
            }
        }

        var ref = database.ref("Clubs/"+clubName)

        var data = {
            name: clubName,
            description: clubDescription,
            topics: topics,
            image: clubImg
        }
        ref.push(data);

        var ref2 = database.ref('Clubs/'+clubName+"/Members");

        var placeholder = {
            email: "",
            role: ""
        }
        ref2.push(placeholder)

        for (var i in emails) {
            ref2.push({
                email: emails[i],
                role: "head"
            });
        }
        location.reload()
    }
}

function join() {
    var id = this.id
    var user = firebase.auth().currentUser;
    var ref = database.ref('Clubs/'+id+"/Members");
    var data = {
        email: user.email,
        role: "member"
    }
    ref.push(data);
}