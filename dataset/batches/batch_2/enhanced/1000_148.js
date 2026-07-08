setcpm(100/4)
$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)
$: note("a#5 g#5 e5 c#5").clip(1).gain(.4).release(.2).attack(.05)
$: note("c2 ~ ~ ~").s("sawtooth").lpf(600).gain(.4).release(.2)
