/*
  WIRING LAYOUT:

  Breadboard Direction: 
    -
    +


*/


int lightButton;
bool isPressed = false;
int mode = 1;

void setRGB() {
    Serial.println();
    Serial.print("rgbButton*");
    mode = 1;
}

void setLCD() {
    Serial.println();
    Serial.print("lcdButton*");
    mode = 2;
}

void setPhoto() {
  Serial.println();
  Serial.print("photoButton*");
  mode = 3;
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(13,OUTPUT);
  digitalWrite(13,LOW);

  pinMode(5,INPUT);
  pinMode(3,INPUT);
  pinMode(2,INPUT);


  attachInterrupt(digitalPinToInterrupt(3),setRGB,CHANGE);
  attachInterrupt(digitalPinToInterrupt(2),setLCD,CHANGE);

}

void loop() {
  // put your main code here, to run repeatedly:
  int light = analogRead(A0);
  int lightButton = digitalRead(5);

  if (lightButton == HIGH) {
    setPhoto();
    Serial.println();
  }

  if (mode == 3) {
    char buf[80];
    sprintf(buf,"res:%d*",light);
    Serial.println(buf);
    delay(1000);
  }

  if (mode == 1) {
    if (Serial.available()) {
    String test = Serial.readStringUntil('*') + "*";
    //Serial.flush();
    Serial.print(test);
  } 
}

  if (mode == 2) {
    if (Serial.available()) {
    String test = Serial.readStringUntil('*') + "*";
    //Serial.flush();
    Serial.print(test);
    }
  }
}

