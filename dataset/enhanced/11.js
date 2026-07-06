setcpm(120/4)

$: s("bd*4").bank("Linn9000").gain(.85)

$: s("~ hh ~ hh").bank("Linn9000").gain("[1 .5]*2").gain(.2)

$: s("woodblock:1 ~ woodblock:2*2 ~").gain(.4).pan(.6)

$: n("0 3 7 5 3 0 5 7").scale("c:minor").s("psaltery_pluck")
  .clip(1).release(.3).room(.3).gain(.4)

$: n("<c2 eb2 g1 bb1>").scale("c:minor").s("sawtooth")
  .lpf(800).release(.2).gain(.5)
