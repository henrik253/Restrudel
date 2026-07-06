setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ oh ~ oh").gain(.35)

$: s("hh*8").gain("[.2 .13]*4").pan(.45)

$: n("4 0 2 4").scale("e:minor").s("sawtooth")
  .lpf(642).resonance(5).release(.15).room(.3).gain(.4)

$: n("<e2 c2 d2 e2>").scale("e:minor").s("square")
  .lpf(500).release(.22).gain(.5)
