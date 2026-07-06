setcpm(115/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ oh ~ oh").bank("RolandTR909").gain(.3)

$: note("~ f#5@2 a#4@2 e5@2").s("sawtooth")
  .lpf(600).release(.25).gain(.4)

$: n("-2 -1").scale("c:major").struct("x*4").s("gm_choir_aahs:6")
  .room(.4).release(.3).gain(.3)

$: note("<f#2 a#1 e2 c#2>").s("square")
  .lpf(600).release(.25).gain(.5)
