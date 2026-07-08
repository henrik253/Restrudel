setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("clave*2").gain(.3)

$: note("g#4@2 a#4@2").s("triangle")
  .lpf(3000).release(.25).room(.4).gain(.4)

$: note("<g#1 a#1 c#2 f1>").s("sawtooth")
  .lpf(600).release(.3).gain(.5)
