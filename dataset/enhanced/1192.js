setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.8)

$: s("~ cymbal ~ ~").gain(.3).release(.5).attack(.06).clip(1)

$: n("0 2 4 2 5 4 2 0").scale("c:major").s("piano").release(.4).room(.3).gain(.4)

$: n("<c2 g1 a1 f1>").scale("c:major").s("sawtooth").lpf(600).release(.3).gain(.5)
