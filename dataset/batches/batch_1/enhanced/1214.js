setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .12]*4").pan(.45)

$: note("d#5 d#5 d5 d5").s("supersaw")
  .lpf(1800).resonance(5).release(.2).delay(.35).room(.3).gain(.4)

$: note("<d#2 d#2 a#1 c2>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
