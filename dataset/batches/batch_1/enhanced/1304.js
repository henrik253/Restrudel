setcpm(140/4)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ oh ~ oh").gain(.22)

$: s("amen*2").gain(.5).room(.2)

$: n("0 3 5 7").scale("c:minor").s("sawtooth")
  .lpf(1500).release(.15).gain(.4)
