setcpm(100)

$: s("bd*4 ~ cp ~").slow(2).bank("RolandTR909").gain(.8)

$: note("12 3").fm(2).gain(1.4).lpf(1500).gain(.4)

$: s("rect misc:2 snare_rim:0 gong 8 brakedrum:1 ~ 3").bank("YamahaRY30").room(.9).bank("RolandTR909").gain(.8)

$: n("3 ~ 1 ~ 2 3").lpf(1500).gain(.4)
