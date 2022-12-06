/*
  WIRING LAYOUT:

  Breadboard Direction: 
    -
    +

  Wires:
  5v -> + breadboard hole #1
  (Power) GND -> - breadboard hole #2
  (Digital) GND -> - breadboard last hole on LCD side (used to power RGB gnd pin)

*/



#include <SoftwareSerial.h>
#include <LiquidCrystal.h>
#include "ColorConverterLib.h"

const int rs = 13, en = 12, d4 = 11, d5 = 10, d6 = 9, d7 = 8;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

// SoftwareSerial mySerial(2,3); // Testing Purpose
int count = 0;

int red_light_pin= 3; // 100 ohms
int green_light_pin = 5; // 330 ohms
int blue_light_pin = 6; // 220 ohms

void RGB_parser(String hsv) {
  int num = 0;
  String rgb[3];

  while (hsv.length() > 0) {
    int index = hsv.indexOf(' ');
    if (index == -1) {
      rgb[num++] = hsv;
      break;
    } else {
      rgb[num++] = hsv.substring(0,index);
      hsv = hsv.substring(index+1);
    }
  }

analogWrite(3,rgb[0].toInt());
analogWrite(5,rgb[1].toInt());
analogWrite(6,rgb[2].toInt());

}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  // mySerial.begin(9600);

  pinMode(3,OUTPUT);
  pinMode(5,OUTPUT);
  pinMode(6,OUTPUT);

  lcd.begin(16, 2);
  lcd.setCursor(0, 0);
  lcd.print("LCD is on");
}

void loop() {
  // put your main code here, to run repeatedly:

  if (Serial.available()) {
    String test = Serial.readStringUntil('*');
    if (test[0] == 'L') {
      lcd.clear();
      lcd.setCursor(0, 0);
      if (test.length() > 4) {
        lcd.print(test.substring(4));
        Serial.println(test.substring(4));
      }
    }
     else if (test.indexOf("rgbButton") == -1 && test.indexOf("lcdButton") == -1 && test.indexOf("photoButton") == -1 && test.indexOf("res:") == -1)  {  // change conditional to check for if (test != rgbButton* || test != lcdButton*)
      RGB_parser(test);
  }
}
}

  //serial update state of game constantly
  // one of the serials read from Node


  // if (buttonMode == LOW && isPressed) {
  //   isPressed = false;
  // }
