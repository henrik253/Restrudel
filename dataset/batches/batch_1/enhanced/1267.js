setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("oh*4").bank("RolandTR808").gain(.18)

$: s("bd*3 ~").bank("RolandTR808").gain(.3)

$: n("b4 b4 b4 b4 b4 f4 ~ ~").scale("b:minor").s("pad").lpf(2200).release(.4).room(.4).gain(.3)

$: n("<b1 b1 f#1 f1>").scale("b:minor").s("sawtooth").lpf(650).release(.25).gain(.5)
