setcpm(100)

$: s("lead gm_pad_warm").pan(.6).gain(.3).release(.0513).lpf(1500).gain(.4)

$: note("a3 b3 c4 d4").lpf(1500).gain(.4)

$: s("gm_electric_guitar_jazz bd*4").slow(2).bank("RolandTR909").gain(.8)

$: s("ocarina sd:2 bd hh cp ~ cp ~ cp ~ cp ~ cp ~ cp ~ cp ~ cp ~ cp ~ cp ~ cp ~ cp ~ cp ~").slow(2.5532).bank("RolandTR909").gain(.8)
