setcpm(110/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: n("1 5 4 3").scale("c3:major").s("gm_oboe")
  .clip(.4).room(.6).release(.2).gain(.35)

$: n("1 2 1 2").scale("c2:major").s("sawtooth").lpf(600).release(.25).gain(.5)

$: n("0 3 5 7").scale("c:major").s("square")
  .lpf(1800).release(.15).delay(.3).gain(.3)
