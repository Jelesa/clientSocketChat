import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageType } from 'src/models/message-type.enum';
import { Message } from 'src/models/message.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  socket: WebSocket = new WebSocket("ws://localhost:5000/ws");

  openFailed: boolean = false;
  isOpen: boolean = false;
  isNameSetted: boolean = false;
  isError: boolean = false;
  nameError: string = '';

  messageTypes: typeof MessageType = MessageType;

  messages: Message[] = [];

  name: string = '';

  messageText: string = '';

  private connectAttempt: number = 0;

  constructor() {
  }

  ngOnInit(): void {
    this.initSocketClient();
  }

  initSocketClient() {

    if (this.connectAttempt === 2) {
      this.openFailed = true;

      return;
    }

    this.socket = new WebSocket("ws://localhost:5000/ws");

    this.socket.onopen = () => {
      this.isOpen = true;

      this.connectAttempt = 0;
    };

    this.socket.onclose = () => {
      this.isOpen = false;

      this.connectAttempt++;

      this.initSocketClient();
    };

    this.socket.onmessage = (msg) => {
      this.processMessage(msg.data);
    }

  }

  setName() {
    const message: Message = {
      body: this.name,
      senderName: this.name,
      messageType: this.messageTypes.SetName
    }

    this.socket.send(JSON.stringify(message));
  }

  sendMessage() {

    if (!this.messageText) {
      return;
    }

    const message: Message = {
      body: this.messageText,
      senderName: this.name,
      messageType: this.messageTypes.Text
    }

    this.socket.send(JSON.stringify(message));

    this.messageText = '';

  }

  processMessage(messageData: string) {
    const object = JSON.parse(messageData) as Message;

    switch (object.messageType) {
      case this.messageTypes.AcceptName: {
        this.isNameSetted = true;
        this.nameError = '';
        break;
      }
      case this.messageTypes.ErrorName: {
        this.isNameSetted = false;
        this.nameError = object.body;
        this.isError = true;
        break;
      }
      case this.messageTypes.Text: {
        this.messages.push(object);

        setTimeout(() => {
          var objDiv = document.getElementById("chat");

          if (!!objDiv)
            objDiv.scrollTop = objDiv.scrollHeight;
        }, 10)
      }
    }
  }
}
