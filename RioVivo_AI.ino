/*
 RioVivo AI - Arduino Uno
 Sensores: pH (A0), turbidez (A1), DS18B20 (D2), HC-SR04 (D7/D8).
 LED RGB: D9/D10/D11. Buzzer: D12.
 Instale as bibliotecas OneWire e DallasTemperature.
 ATENÇÃO: calibre pH e turbidez conforme o modelo comprado.
*/
#include <OneWire.h>
#include <DallasTemperature.h>
const int PH=A0,TURB=A1,ONEWIRE=2,TRIG=7,ECHO=8,R=9,G=10,B=11,BUZZ=12;
OneWire oneWire(ONEWIRE); DallasTemperature temp(&oneWire);
const float PH7V=2.50, PHSLOPE=0.18, MAXDIST=100.0;
float getPH(){float v=analogRead(PH)*5.0/1023.0;return constrain(7.0+(PH7V-v)/PHSLOPE,0,14);}
float getTurb(){float v=analogRead(TURB)*5.0/1023.0;float n=-1120.4*v*v+5742.3*v-4352.9;return constrain(n,0,3000);}
float getTemp(){temp.requestTemperatures();return temp.getTempCByIndex(0);}
float getDist(){digitalWrite(TRIG,LOW);delayMicroseconds(2);digitalWrite(TRIG,HIGH);delayMicroseconds(10);digitalWrite(TRIG,LOW);long t=pulseIn(ECHO,HIGH,30000);return t?t*.0343/2:MAXDIST;}
int getLevel(){return constrain((int)(100-(getDist()/MAXDIST*100)),0,100);}
void rgb(int r,int g,int b){analogWrite(R,r);analogWrite(G,g);analogWrite(B,b);}
void setup(){Serial.begin(9600);pinMode(TRIG,OUTPUT);pinMode(ECHO,INPUT);pinMode(R,OUTPUT);pinMode(G,OUTPUT);pinMode(B,OUTPUT);pinMode(BUZZ,OUTPUT);temp.begin();}
void loop(){float ph=getPH(),tu=getTurb(),te=getTemp();int lv=getLevel();bool danger=ph<6||ph>9||tu>100||te<15||te>32||lv>85;bool att=ph<6.5||ph>8.5||tu>50||te<18||te>29||lv>65;if(danger){rgb(255,0,0);digitalWrite(BUZZ,HIGH);}else if(att){rgb(255,180,0);digitalWrite(BUZZ,LOW);}else{rgb(0,255,0);digitalWrite(BUZZ,LOW);}
Serial.print("{\"ph\":");Serial.print(ph,2);Serial.print(",\"turbidity\":");Serial.print(tu,1);Serial.print(",\"temperature\":");Serial.print(te,2);Serial.print(",\"level\":");Serial.print(lv);Serial.println("}");delay(1000);}
