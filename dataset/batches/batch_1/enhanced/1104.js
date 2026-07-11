setcpm(120/4)

$: s("bd ~ bd*2 ~ ~ sd ~ hh*2 sd bd*2").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.18).pan(.4)

$: note("c4@2 a#3@2 d#4").s("triangle").lpf(4970).resonance(7)
  .release(.2).gain(.35)

$: note("c5 d5 e5 g5 e5 d5 c5 d5").s("sawtooth")
  .lpf(2500).room(.6).delay(.2).release(.2).gain(.3)
