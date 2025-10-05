#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Pins
const int trigPin = 9;
const int echoPin = 10;
const int redLED = 7;
const int greenLED = 8;
const int buzzer = 6;

// Ultrasonic variables
long duration;
int distance;
const int userThreshold = 40; // cm

LiquidCrystal_I2C lcd(0x27, 16, 2);

bool isStudyTime = true;
bool lastSession = true;

bool isFinished = false;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(redLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  pinMode(buzzer, OUTPUT);

  Serial.begin(9600);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0,0);
  lcd.print("LOCK IN! :)");
  delay(2000);
  lcd.clear();
}

void loop() {
  if (isFinished) return;

  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);


  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");


  bool userPresent = (distance < userThreshold);

  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command == "STUDY") {
      isStudyTime = true;
    } 
    else if (command == "BREAK") {
      isStudyTime = false;
    }
    else if (command == "FINISHED") {
      isFinished = true;
      digitalWrite(redLED, HIGH);
      digitalWrite(greenLED, HIGH);
      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print("Session Over    ");
      lcd.setCursor(0,1);
      lcd.print("Good job!       ");
      return;
    }
  }

  if(userPresent){

    if(isStudyTime){
      digitalWrite(redLED, HIGH);
      digitalWrite(greenLED, LOW);
      lcd.setCursor(0,0);
      lcd.print("Study Time      ");
      lcd.setCursor(0,1);
      lcd.print("Focus!          ");
    } else {
      digitalWrite(redLED, LOW);
      digitalWrite(greenLED, HIGH);
      lcd.setCursor(0,0);
      lcd.print("Break Time      ");
      lcd.setCursor(0,1);
      lcd.print("Relax :)        ");
    }
  } else {
    // No user
    digitalWrite(redLED, LOW);
    digitalWrite(greenLED, LOW);
    lcd.setCursor(0,0);
    lcd.print("No user detected");
    lcd.setCursor(0,1);
    lcd.print("                ");
  }

  if (lastSession != isStudyTime) {
    tone(buzzer, 1000, 500);   // 1000 hz tone for 500 ms
  }

  lastSession = isStudyTime;
  delay(500);
}