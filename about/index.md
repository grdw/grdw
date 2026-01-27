---
layout: default
---

<h1 id="header">About</h1>
## Whoami
The name grdw are all the unique consonants of my first name (Gerard), followed by the first character of my last name (Westerhof). I've been an engineer since 2013 and have contributed to a lot of projects in various shapes and sizes.

## Experience

{% for job in site.data.jobs %}
<div class="job">
    <h3>{{ job.company }} <span class="date">({{ job.from }} - {{ job.to }})</span></h3>
    <div class="projects">
        {% for project in job.projects %}
        <h4>Project: {{ project.name }}</h4>
        <p>{{project.description }}</p>
        {% endfor %}
    </div>

    <ul class="tags">
    {% for tag in job.tags %}
    <li>{{ tag }}</li>
    {% endfor %}
    </ul>
</div>
{% endfor %}


### Privacy
This website features no trackers except those that are enabled by
third parties. I have no idea who is visiting, how many people are visiting,
from where and why they are visiting. I sincerely don't care about any
of it. If you feel like checking the source code, you are free <a href="https://github.com/grdw/grdw" target="_blank">to do so</a>.

### Links
<a target="_blank" href="https://github.com/grdw">github</a> |
<a href='mailto:gerard@grdw.nl'>mail</a> |
<a href='https://letterboxd.com/Fietsband' target='_blank'>letterboxd</a> |
<a href='https://www.discogs.com/seller/LorikeetRecords/profile' target='_blank'>lorikeet records</a> |
<a href='https://bsky.app/profile/fietsband.bsky.social' target='_blank'>bluesky</a>
