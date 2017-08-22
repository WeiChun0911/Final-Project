"use strict";
//第三方
import React from "react";
import { connect } from "react-redux";
import socket from "../socket";
//lib
import chat from "../lib/chat";
import recognition from "../lib/recognition";
import Recorder from "../lib/recorder";
//component
import IndexLogo from "./IndexLogo";
import ParticipantList from "./ParticipantList";
//action
import {
    addParticipantList,
    addParticipantConnection,
    delParticipantConnection,
    delRemoteStreamURL,
    addCandidateQueue,
} from "../actions/Actions";

let configuration = {
    iceServers: [
        {
            url: "stun:stun.l.google.com:1302"
        },
        {
            url: "stun:stun.services.mozilla.com"
        }
    ]
};

class Meeting extends React.Component {
    constructor(props) {
        super(props);
        this.Chat = chat.createNew(this);
        this.Recognizer = recognition.createNew(this);
        this.localUserID = "";
        this.videoList = [];
        this.getSystemTime = this.getSystemTime.bind(this);
        //this.Chat.toggleUserMedia = this.Chat.toggleUserMedia.bind(this.Chat);
        this.languageList = [
            ["Afrikaans", ["af-ZA"]],
            ["Bahasa Indonesia", ["id-ID"]],
            ["Bahasa Melayu", ["ms-MY"]],
            ["Català", ["ca-ES"]],
            ["Čeština", ["cs-CZ"]],
            ["Dansk", ["da-DK"]],
            ["Deutsch", ["de-DE"]],
            [
                "English",
                ["en-AU", "Australia"],
                ["en-CA", "Canada"],
                ["en-IN", "India"],
                ["en-NZ", "New Zealand"],
                ["en-ZA", "South Africa"],
                ["en-GB", "United Kingdom"],
                ["en-US", "United States"]
            ],
            [
                "Español",
                ["es-AR", "Argentina"],
                ["es-BO", "Bolivia"],
                ["es-CL", "Chile"],
                ["es-CO", "Colombia"],
                ["es-CR", "Costa Rica"],
                ["es-EC", "Ecuador"],
                ["es-SV", "El Salvador"],
                ["es-ES", "España"],
                ["es-US", "Estados Unidos"],
                ["es-GT", "Guatemala"],
                ["es-HN", "Honduras"],
                ["es-MX", "México"],
                ["es-NI", "Nicaragua"],
                ["es-PA", "Panamá"],
                ["es-PY", "Paraguay"],
                ["es-PE", "Perú"],
                ["es-PR", "Puerto Rico"],
                ["es-DO", "República Dominicana"],
                ["es-UY", "Uruguay"],
                ["es-VE", "Venezuela"]
            ],
            ["Euskara", ["eu-ES"]],
            ["Filipino", ["fil-PH"]],
            ["Français", ["fr-FR"]],
            ["Galego", ["gl-ES"]],
            ["Hrvatski", ["hr_HR"]],
            ["IsiZulu", ["zu-ZA"]],
            ["Íslenska", ["is-IS"]],
            ["Italiano", ["it-IT", "Italia"], ["it-CH", "Svizzera"]],
            ["Lietuvių", ["lt-LT"]],
            ["Magyar", ["hu-HU"]],
            ["Nederlands", ["nl-NL"]],
            ["Norsk bokmål", ["nb-NO"]],
            ["Polski", ["pl-PL"]],
            ["Português", ["pt-BR", "Brasil"], ["pt-PT", "Portugal"]],
            ["Română", ["ro-RO"]],
            ["Slovenščina", ["sl-SI"]],
            ["Slovenčina", ["sk-SK"]],
            ["Suomi", ["fi-FI"]],
            ["Svenska", ["sv-SE"]],
            ["Tiếng Việt", ["vi-VN"]],
            ["Türkçe", ["tr-TR"]],
            ["Ελληνικά", ["el-GR"]],
            ["български", ["bg-BG"]],
            ["Pусский", ["ru-RU"]],
            ["Српски", ["sr-RS"]],
            ["Українська", ["uk-UA"]],
            ["한국어", ["ko-KR"]],
            [
                "中文",
                ["cmn-Hans-CN", "普通话 (中国大陆)"],
                ["cmn-Hans-HK", "普通话 (香港)"],
                ["cmn-Hant-TW", "中文 (台灣)"],
                ["yue-Hant-HK", "粵語 (香港)"]
            ],
            ["日本語", ["ja-JP"]],
            ["हिन्दी", ["hi-IN"]],
            ["ภาษาไทย", ["th-TH"]]
        ];
        this.hatList = [
            [
                1,
                "WhiteHat",
                [
                    "白色代表中性與客觀。",
                    "白帽只會關心客觀的事實和數字。",
                    "白帽不會受到感情因素的影響，不對事實加以論述",
                    "白帽不會將其作為達成某種目的的手段，而僅僅是平白地敘述出來，否則會失去其客觀的立場。",
                    "相關的例子像是：「請告訴我這個月的銷售數量」。"
                ]
            ],
            [
                2,
                "GreenHat",
                [
                    "綠色代表生機勃勃、茁壯與成長。象徵創新與新觀念",
                    "綠帽試圖擺脫舊想法，以便找出更好的新想法。",
                    "綠帽思維需要新思想、新方法和更多的選擇",
                    "綠帽只需要作出時間與努力產生新想法。"
                ]
            ],
            [
                3,
                "BlueHat",
                [
                    "藍色代表冷靜，象徵控制與調整。",
                    "藍帽需要利用其他顏色的帽子",
                    "它定義主題，對各種思維實行集中，並對問題進行分類，決定需要執行的思維任務。",
                    "藍帽負責概要、總攬和結論",
                    "監督遊戲的規則得以遵守，是一種約束的存在。它就像是秩序的管理者一樣。"
                ]
            ],
            [
                4,
                "RedHat",
                [
                    "紅色代表生氣、發怒與各種感情。",
                    "紅色討論的是思維中的情緒、感覺以及其他非理性方面",
                    "例子：「我有一種直覺，他的行銷方案最終會失敗」",
                    "例子：「我感覺她是所有人當中，最有洞見的人」"
                ]
            ],
            [
                5,
                "BlackHat",
                [
                    "黑色代表憂鬱和否定。象徵謹慎、批評。",
                    "黑帽討論否定方面的問題，它消極且缺乏情感。",
                    "黑帽強調的否定只限於在邏輯否定這一點上。",
                    "黑帽大多對提出的數字和報告提出疑義。",
                    "例如：「從過去的經驗來看，街頭宣傳對我們的品牌知名度沒有任何的效益。"
                ]
            ]
        ];
        this.state = {
            time: "",
            roomURL: "沒東西欸?",
            isStreaming: false,
            isSounding: false,
            isRecognizing: false,
            videoIsReady: false,
            localVideoURL: "",
            isinviteOpen: false,
            isAgendaOpen: false,
            isBrainstormingOpen: false,
            agendaList: [],
            hatColor: [],
            recognitionResult: "",
            textRecord: []
        };
    }

    componentWillMount() {}

    componentDidMount() {
        this.getRoom();
        //初始化區
        socket.emit(
                "IAmAt",
                window.location.pathname,
                window.location.hash
            );
        socket.emit("giveMeMySocketId");
        this.getSystemTime();
        this.timer = setInterval(this.getSystemTime, 1000);
        socket.on("gotSocketID", id => {
            this.localUserID = id;
            //this.props.dispatch(addParticipant(this.localUserID));
            this.Recognizer.id = this.localUserID;
            this.Chat.getUserMedia(
                this.localUserID,
                window.location.hash,
                socket
            );
        });

        socket.on("joinRoom", () => {
            socket.emit("join", window.location.hash);
        });


        //連線區
        socket.on("newParticipantB", participantID => {
            //接到新人加入的訊息時，檢查是否已有連線
            if (this.props.connections[participantID]) {
                console.log("已存在，刪除該連線，再重新連線");
                this.props.dispatch(delParticipantConnection(participantID));
            }
            //主動建立連線
            let isInitiator = true;
            let peerConn = this.Chat.createPeerConnection(
                isInitiator,
                configuration,
                participantID,
                socket
            );

            peerConn
                .createOffer()
                .then(offer => {
                    //console.log("offer" + JSON.stringify(offer));
                    peerConn.setLocalDescription(offer);
                    socket.emit(
                        "offerRemotePeer",
                        offer,
                        this.localUserID,
                        participantID
                    );
                })
                .catch(e => {
                    console.log("發生錯誤了看這裡: " + e);
                });
            //MeetingActions.addRemoteStreamURL
            //console.log(peerConn.getRemoteStreams());
        });

        socket.on("answer", (answer, sender) => {
            console.log(this.props.connections[sender]);
            //console.log("answer" + JSON.stringify(answer));
            //console.log('有收到answer喔!');
            let settingPromise = this.props.connections[sender].setRemoteDescription(
                new RTCSessionDescription(answer)
            );
            //console.log(this.state.connections[sender].getRemoteStreams()[0]);
        });

        socket.on("onIceCandidateB", (candidate, sender) => {
            if (this.props.connections[sender]) {
                //console.log('加到了!');
                this.props.connections[sender]
                    .addIceCandidate(new RTCIceCandidate(candidate))
                    .catch(e => {
                        console.log("發生錯誤了看這裡: " + e);
                    });
            } else {
                this.props.dispatch(addCandidateQueue({ id: sender, candidate:candidate  }))
                //console.log('不!來不及加');
            }
        });

        socket.on("offer", (offer, sender) => {
            if (this.props.connections[sender]) {
                this.props.dispatch(delParticipantConnection(sender));
            }
            //console.log('收到遠端的 offer，要建立連線並處理');
            let isInitiator = false;
            let peerConn = this.Chat.createPeerConnection(
                isInitiator,
                configuration,
                sender,
                socket
            );
            this.props.dispatch(addParticipantConnection({ id: sender, connectionObj: peerConn }));
            peerConn
                .setRemoteDescription(new RTCSessionDescription(offer))
                .then(() => {
                    return peerConn.createAnswer();
                })
                .then(answer => {
                    console.log("創建好本地端的 " + answer + "，要傳出去");
                    peerConn.setLocalDescription(answer);
                    socket.emit(
                        "answerRemotePeer",
                        answer,
                        this.localUserID,
                        sender
                    );
                })
                .catch(e => {
                    console.log("發生錯誤了看這裡:" + e);
                });
        });

        socket.on("participantDisconnected", (participantID)=>{
            this.props.dispatch(delParticipantConnection(participantID));
            this.props.dispatch(delRemoteStreamURL(participantID));
        })

        //0516 更新腦力激盪
        // socket.on("OpenBrainForAll", function(agenda) {
        //     //console.log(agenda);
        //     //MeetingActions.changeBrainstormingState();
        // });

        //0516 更新消失的議程
        socket.on("addAgendaForAll", function(agenda) {
            this.setState({
                agendaList: agenda
            });
        });

        socket.on("deleteAgendaForAll", function(agenda) {
            this.setState({
                agendaList: agenda
            });
        });

        for (let i = 0; i < this.languageList.length; i++) {
            this.refs.select_language.options[i] = new Option(
                this.languageList[i][0],
                i
            );
        }
        this.refs.select_language.selectedIndex = 36;
        this.updateCountry();
        this.refs.select_dialect.selectedIndex = 2;

        socket.on("videoFromDB", arrayBuffer => {
            //console.log("Getting blob form DB and server!!");
            let blob = new Blob([arrayBuffer], { type: "video/webm" });
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            a.download = this.localUserID + ".webm";
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        socket.emit("leaveRoom");
        if(this.state.isStreaming){
            this.Chat.toggleUserMedia();
        }
        if(this.state.isSounding){
            this.Chat.toggleAudio();
        }
    }

    getRoom() {
        if (window.location.hash) {
            this.setState({
                roomURL: window.location.href
            });
        } else {
            window.location.hash = Math.floor((1 + Math.random()) * 1e16)
                .toString(16)
                .substring(8);
            this.setState({
                roomURL: window.location.href
            });
        }
    }

    getSystemTime() {
        let d = new Date();
        d =
            d.getFullYear() +
            "-" +
            ("0" + (d.getMonth() + 1)).slice(-2) +
            "-" +
            ("0" + d.getDate()).slice(-2) +
            " " +
            ("0" + d.getHours()).slice(-2) +
            ":" +
            ("0" + d.getMinutes()).slice(-2) +
            ":" +
            ("0" + d.getSeconds()).slice(-2);
        this.setState({
            time: d
        });
    }

    handleSendText_Click() {
        let inputText = this.refs.meet_input.value;
        this.Chat.sendText(inputText);
        this.refs.meet_input.value = "";
    }

    handleSendText_Enter(e) {
        if (e.charCode == 13) {
            //按下enter後
            e.preventDefault();
            this.handleSendText_Click();
        }
    }

    toUser() {
        let file = this.refs.meet_fileupload.files[0];
        this.Chat.sendFileToUser(file);
    }

    download() {
        this.recorder.download();
    }

    setLanguage(e) {
        this.Recognizer.setLanguage(e.target);
    }

    updateCountry() {
        //有換國家，就清空方言列
        for (let i = this.refs.select_dialect.options.length - 1; i >= 0; i--) {
            this.refs.select_dialect.remove(i);
        }
        //接著把那個國家的方言陣列取出來
        let list = this.languageList[this.refs.select_language.selectedIndex];
        //把那個國家的方言new出來
        for (let i = 1; i < list.length; i++) {
            //選項      //值
            this.refs.select_dialect.options.add(
                new Option(list[i][1], list[i][0])
            );
            if (list[i][1]) {
                this.refs.select_dialect.style.visibility = "initial";
            } else {
                this.refs.select_dialect.style.visibility = "hidden";
            }
        }
    }

    onClick_invitepage() {
        this.setState({
            isinviteOpen: !this.state.isinviteOpen
        });
    }

    onClick_backtoindex() {
        let txt;
        let r = confirm("要結束會議，並檢視會議紀錄?");
        if (r == true) {
            window.location.href = "https://140.123.175.95:8787/history" + room;
        }
    }

    onClick_agenda() {
        this.setState({
            isAgendaOpen: !this.state.isAgendaOpen
        });
    }

    onClick_deleteAgenda(key) {
        this.setState({
            agendaList: this.state.agendaList.filter(item => {
                return item !== key;
            })
        });
        socket.emit("deleteAgenda", this.state.agendaList);
    }

    onClick_addAgenda() {
        if (this.refs.agenda_input.value) {
            let newText = this.refs.agenda_input.value;
            this.setState({
                agendaList: this.state.agendaList.concat([newText])
            });
            socket.emit("addAgenda", this.state.agendaList);
            this.refs.agenda_input.value = "";
        }
    }

    onClick_BrainToggle() {
        if (!this.state.isBrainstormingOpen) {
            this.changeHat();
        }
        this.setState({
            isBrainstormingOpen: !this.state.isBrainstormingOpen
        });
    }

    changeHat() {
        let random = Math.floor(Math.random() * 5);
        this.setState({
            hatColor: this.hatList[random]
        });
    }

    render() {
        let remoteVideo = [];
        for (let id in this.props.connections) {
            if (this.props.remoteStreamURL) {
                if (this.props.remoteStreamURL[id]) {
                    remoteVideo.push(
                        <div id="VideoUser-audio-on">
                            <video
                                autoPlay={true}
                                id={"videoSrc"}
                                width="220"
                                key={id}
                            >
                                <source
                                    src={
                                        this.props.remoteStreamURL[id]
                                            ? this.props.remoteStreamURL[id]
                                            : "沒加到啦幹"
                                    }
                                />
                            </video>
                        </div>
                    );
                }
            } else {
                remoteVideo.push(
                    <div id="VideoUser-audio-on">
                        <video
                            autoPlay={true}
                            id={"videoSrc"}
                            width="220"
                            key={id}
                        />
                    </div>
                );
            }
        }
        let agenda;
        if (this.state.agendaList.length > 0) {
            agenda = this.state.agendaList.map(item => {
                return (
                    <li id="agenda-li">
                        {item}
                        <button
                            onClick={() => this.onClick_deleteAgenda(item)}
                            id="cancel"
                        >
                            刪除
                        </button>
                    </li>
                );
            });
        }

        let chat = [];
        if (this.state.textRecord.length > 0) {
            this.state.textRecord.map(obj => {
                if (obj.userID == this.localUserID) {
                    chat.push(
                        <div id="me_sent">
                            <div className="arrow_box4">
                                <div id="me-text">{obj.text}</div>
                            </div>
                            <div id="me-sendtime">{obj.sendTime}</div>
                        </div>
                    );
                } else {
                    chat.push(
                        <div id="number_sent">
                            <div id="number-userid">{obj.UserID}</div>
                            <div className="arrow_box3">
                                <div id="number-text">
                                    {obj.Text}
                                </div>
                            </div>
                            <div id="number-sendtime">{obj.sendTime}</div>
                        </div>
                    );
                }
            });
        }

        let brainSupport;
        if (this.state.hatColor[2]) {
            brainSupport = this.state.hatColor[2].map(value => {
                return <li>{value}</li>;
            });
        }

        return (
            <div>
                <IndexLogo />
                <ParticipantList />
                <div className="box-b">
                    <div id="meet_chat">
                        <div id="chat_menu">
                            <div id="button" />
                            <div id="meet_name">WeMeet開會群組</div>
                        </div>
                        <div id="chatbox">
                            {chat}
                        </div>

                        <div id="yourvoice">
                            <img
                                id="voice_img"
                                src={
                                    this.state.isRecognizing
                                        ? "../img/mic-animate.gif"
                                        : "../img/mic.gif"
                                }
                            />
                            {this.state.recognitionResult}
                        </div>
                        <div id="meet_chat_input">
                            <textarea
                                onKeyPress={e => {
                                    this.handleSendText_Enter(e);
                                }}
                                id="meet_input"
                                ref="meet_input"
                            />
                            <button
                                className="sent"
                                type="submit"
                                ref="meet_submit"
                                maxLength="25"
                                onClick={() => {
                                    this.handleSendText_Click();
                                }}
                            >
                                送出
                            </button>
                        </div>

                    </div>
                    <div id="feature">
                        <div className="left">
                            <button
                                id={
                                    this.state.isRecognizing
                                        ? "recognize-on"
                                        : "recognize-off"
                                }
                                onClick={this.Recognizer.toggleButtonOnclick}
                            >
                                {this.state.isRecognizing ? "停止辨識" : "開始辨識"}
                            </button>
                            <button
                                id={
                                    this.state.isStreaming
                                        ? "video-off"
                                        : "video-on"
                                }
                                onClick={()=>{this.Chat.toggleUserMedia()}}
                            >
                                {this.state.isStreaming ? "停止視訊" : "開起視訊"}
                            </button>
                            <button
                                id={
                                    this.state.isSounding
                                        ? "audio-off"
                                        : "audio-on"
                                }
                                onClick={this.Chat.toggleAudio}
                            >
                                {this.state.isSounding ? "靜音" : "取消靜音"}
                            </button>
                        </div>

                        <div className="center">
                            <button
                                id="invite"
                                onClick={this.onClick_invitepage.bind(this)}
                            >
                                邀請
                            </button>
                            <button
                                id={
                                    this.state.isAgendaOpen
                                        ? "agenda-off"
                                        : "agenda-on"
                                }
                                onClick={this.onClick_agenda.bind(this)}
                            >
                                {this.state.isAgendaOpen ? "關閉議程" : "議程清單"}
                            </button>
                            <button
                                id={
                                    this.state.isBrainstormingOpen
                                        ? "brainstorming-off"
                                        : "brainstorming-on"
                                }
                                onClick={this.onClick_BrainToggle.bind(this)}
                            >
                                {this.state.isBrainstormingOpen ? "關閉" : "腦力激盪"}
                            </button>

                            <div id="systemTime">
                                系統時間：{this.state.time}
                            </div>
                        </div>

                        <div className="right">

                            <button id="end" onClick={this.onClick_backtoindex}>
                                結束會議
                            </button>
                        </div>
                    </div>

                    <div id="meet_main" ref="meet_main">

                        <div
                            id={
                                this.state.isRecognizing
                                    ? "recognition_detail_off"
                                    : "recognition_detail_on"
                            }
                        >
                            <select
                                name="language"
                                id="language"
                                ref="select_language"
                                onClick={this.updateCountry.bind(this)}
                            />
                            <select
                                name="dialect"
                                id="dialect"
                                ref="select_dialect"
                                onClick={e => {
                                    this.Recognizer.setLanguage(e.target);
                                }}
                            />
                        </div>

                        <div
                            id={
                                this.state.isinviteOpen
                                    ? "invite_detail_on"
                                    : "invite_detail_off"
                            }
                        >
                            <div id="meetpage">網址：</div>
                            <textarea
                                id="pagetext"
                                value={this.state.roomURL}
                            />
                        </div>
                        <div
                            id={
                                this.state.isSounding
                                    ? "VideoUser-audio-on"
                                    : "VideoUser-audio-off"
                            }
                        >
                            <video
                                id="videoSrc"
                                width="220"
                                muted="muted"
                                src={
                                    this.state.videoIsReady &&
                                        this.state.isStreaming
                                        ? this.state.localVideoURL
                                        : "沒在播放欸或是沒加到影像"
                                }
                                autoPlay={true}
                            />
                        </div>
                        {remoteVideo}

                        <div
                            id={
                                this.state.isAgendaOpen
                                    ? "nowagenda-on"
                                    : "nowagenda-off"
                            }
                        >
                            <div id="now_agenda">議程清單</div>
                            <div id="agenda_content">
                                <ol>
                                    {agenda}
                                </ol>
                            </div>
                            <input
                                type="text"
                                id="user_input"
                                maxLength="25"
                                ref="agenda_input"
                            />
                            <button
                                id="agenda_button"
                                onClick={this.onClick_addAgenda.bind(this)}
                            >
                                新增
                            </button>
                        </div>

                        <div
                            id={
                                this.state.isBrainstormingOpen
                                    ? "brainbox-on"
                                    : "brainbox-off"
                            }
                        >
                            <div id="BrainText">腦力激盪</div>
                            <div id="BraomSupprot">
                                玩法說明：<br />
                                1. 每個與會者都擁有一頂顏色的帽子<br />
                                2. 每頂帽子都扮演著不同的角色<br />
                                3. 請根據個各帽子說明文字，盡力扮演其角色
                            </div>
                            <div id="BrainHat">
                                你目前所戴的帽子
                                <br />
                                <img
                                    src={
                                        "../img/" +
                                            this.state.hatColor[0] +
                                            ".png"
                                    }
                                />
                            </div>
                            <div id="BarinHatText">
                                <ul>{brainSupport}</ul>
                            </div>
                            <button
                                className="btn"
                                onClick={() => {
                                    this.changeHat();
                                }}
                            >
                                換帽子
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        connections: state.connection.connections,
        remoteStreamURL: state.connection.remoteStreamURL,
        candidateQueue: state.connection.candidateQueue
    };
};

export default connect(mapStateToProps)(Meeting);
