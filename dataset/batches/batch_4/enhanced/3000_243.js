setcpm(100)

$: s("drums 3 crow").note("c3 eb3 g3 bb3 Eb2 Bb2 A2 D2 G2 D2 C#2 F#2 B2").velocity(.55).bank("RolandTR909").gain(.8)

$: sound("sawtooth drum").lpf(4041).gain("<.65 .75 .85>").bank("RolandTR909")

$: s("perc*3 noise*4").gain(.5)
