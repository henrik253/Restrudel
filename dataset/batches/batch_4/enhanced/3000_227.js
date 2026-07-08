setcpm(100)

$: s("bd*2 ~").clip(1).note(21).gain("0.2 0.4 0.3 0.5").bank("RolandTR909")

$: s("hh*4 ~ sd ~ sd:2 bd 4 4 4 0").gain(.943).bank("RolandTR909")

$: note("b@2 f@2 ~ b b@2 b b b b@2 f@2 ~ b ~ a4 d#5@2 ~ a4 d#5@3").lpf(1500).gain(.4)
