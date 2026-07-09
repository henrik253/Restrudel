setcpm(120/4)

$: note("c1 f1 g1 a#1").sound("triangle hadoken").lpf(2000).velocity(2.1346).s("sawtooth")

$: note("~ 3 c3 g#2 c3 f3 a#2 g2 d#2 f2@3 ~ 3 72 g5 e5 c5").velocity(.9).s("sawtooth")

$: note("~ c#5@2 d5@2 c#5@8 ~ 18 g5 c6 g5 d5 g5 b5 g5 c5 e5 a5 e5 c5 f5 a5 f5 ~ ~ ~ g5 ~ ~ ~ d5 ~ ~ ~").s("sawtooth")

$: s("bd*4 sd!2").gain(.7)
