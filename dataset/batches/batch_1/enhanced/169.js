setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.16)

$: n("5 5 ~ 5").scale("a:minor").s("gm_acoustic_guitar_steel:2")
  .room(.25).gain("[.5 .35]*2").transpose(-12)

$: note("b3@2 f3@2 ~ b3 ~ a#4").s("sawtooth")
  .lpf(2400).release(.2).gain("<.4 .5>*8")

$: note("<a1 e2 f1 g1>").s("square")
  .lpf(600).release(.25).gain(.5)
