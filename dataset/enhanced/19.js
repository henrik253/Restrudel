setcpm(124/4)

$: s("bd ~ bd ~").bank("RolandTR808").gain(.85)

$: s("~ crash ~ ~").gain(.4).room(.6)

$: s("hh*8").gain("[.2 .13]*4").pan(.45)

$: n("0 1 4 4 4 12").scale("c:minor").s("sawtooth")
  .lpf(2000).resonance(5).release(.15).delay(.3).gain(.4)

$: n("<0 3 5 4>").scale("c2:minor").s("square")
  .add(note(-12)).lpf(650).release(.25).gain(.5)
