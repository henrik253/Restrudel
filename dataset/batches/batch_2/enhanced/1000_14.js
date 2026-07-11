setcpm(100/4)
$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)
$: n("-2 0 -1 0 1 2 -1").scale("c:minor").s("sawtooth").gain("[1 0.3]*8").lpf(1600)
$: note("c1@2 ~").s("sine").velocity(.4).gain(.5)
