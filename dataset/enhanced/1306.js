setcpm(130/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("rd*8").attack(.005).release(.1).gain(.2)

$: s("~ cr ~ cr").gain(.3).room(.4)

$: n("0 3 7 5").scale("c:minor").s("sawtooth")
  .lpf(1600).release(.2).gain(.4)
