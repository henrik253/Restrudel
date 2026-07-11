setcpm(120/4)

$: s("psaltery_pluck r8_rd:1").bank("RolandTR808").gain(.4).release(.3).attack(.03).decay(.1541).sustain(.5).hpf(8000)

$: s("cowbell ~").gain(.33)

$: s("perc*3 hh*8 perc perc*3").slow(2).gain(.3)

$: s("gm_epiano1:1 psaltery_pluck bd:5 ~").lpf(1500).room(.9).gain(.5).pan(.4)
