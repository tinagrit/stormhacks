# Tomo
Your fruity friend in helping you stay on track with LITERALLY everything!

## Inspiration

Our inspiration for this project comes from our team's difficulty to stay focused while studying. Nowadays, many people experience difficulties in staying focused when trying to work on tasks, whether by procrastination or a lack of motivation. Furthermore, many students tend to not stay organized and do not plan out when important assignments or exams are occurring. This often leads to negative consequences and causes stress, anxiety and desperation. We wanted to try and tackle these issues by building a project that helps students at SFU focus on studying while also planning out their schedules. 


## What it does

Tomo is a website that aims to help students at SFU focus on scheduling and completing their tasks. The website incorporates the pomodoro study method and allows students to customize how long they wish to study for while also taking reasonable breaks that will help them avoid burn out. Students will be able to estimate how much time a task will need, as well as label how important the task is. Tomo also allows students to schedule their tasks so that they can study accordingly. Additionally, Tomo also uses an Arduino and an ultrasonic sensor to notify the website if the student is actively studying. If the student gets out of their chair during their study time, the Arduino will be notified.


## How we built it

Apart from just the backend and frontend we also had a hardware component to our build. Starting with the Frontend, we used Figma to design the outline and overall look of the website. We used HTML, CSS and JavaScript for bringing the Figma designs to life. For the backend, SFUcourses API, Gemini API, NodeJS+ express, and Vercel. We had some more plans to work with Gemini API by having the user upload a pdf and having the AI generate a schedule, however that posed many problems. We used an Arduino along with an ultrasonic distance measuring sensor, LCD 16x2 screen, and a bunch of LEDs & buzzers. We used an online simulator to test our potential circuit and code before trying to use the Arduino itself since we did not want to damage it in any form. 

## Challenges we ran into

During development, we went through a sizeable amount of challenges. We had difficulties with the SFUcourses API as the it gave inconsistent formatting for courses. When trying to parse information given from the API, our code would return several errors due to the different formatting of the courses. Additionally, we had a lot of struggles setting up the backend using Vercel as we often received error 404 and 500 when testing our backend code. It was also our first time working with Arduino, and while trying to make the circuit work, we burnt an LED bulb.

## Accomplishments that we're proud of

We take pride in our ability to set up the Arduino for this project as it was our first time using an Arduino. We spent a long time figuring out what components and code is necessary to make the ultrasonic sensor work. Eventually, after a long struggle, we got the Arduino and the ultrasonic sensor working so that it detects when the student is unfocused. Our team is also proud of incorporating multiple technologies such as Gemini API and Vercel as we had spent a long time debugging errors that were occurring during the testing phase.

## What we learned

Our team learned a lot about working with an Arduino and having it work with our website. Learning how to use an Arduino allows us to work on more projects like Tomo that could benefit other people in the world. Additionally, we learned a lot about working with APIs like Google Gemini and SFUcourses to gather, parse, and generate information. We also learned how to work with Vercel and how to deploy our website. 

## What's next for Tomo

Our team has a lot of ideas for improving Tomo. We wish to implement more sensors to the Arduino to improve its detection. We also would like to implement a validation method to verify if the student is focused on their tasks. This validation method would involve checking to see if the user is switching tabs and giving a warning to the student to make sure they remain focused. We wanted to implement google calendar API but we decided that it would be better to implement it in the future. Additionally, we wanted to add a system that made music playlists for you, depending on what the individual is studying for and the priority scale.
