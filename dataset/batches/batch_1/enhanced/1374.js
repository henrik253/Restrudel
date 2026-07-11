setcpm(118/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.85)

$: s("hh*4 ~ sd ~").bank("RolandTR909").gain(.3)

$: s("~ sd:1!3").bank("RolandTR909").gain(.4)

$: n("3 1 2 1 0").scale("a:minor").s("sawtooth").lpf(1200).release(.2).room(.3).gain(.4)

$: n("0 ~ -3 ~").scale("a:minor").s("square").lpf(500).release(.2).gain(.4)
