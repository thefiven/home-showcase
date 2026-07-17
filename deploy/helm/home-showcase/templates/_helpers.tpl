{{- define "home-showcase.fullname" -}}
{{- .Release.Name -}}
{{- end -}}

{{- define "home-showcase.labels" -}}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: home-showcase
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Labels d'un composant. Usage : {{ include "home-showcase.componentLabels" (dict "root" . "component" "web") }}
*/}}
{{- define "home-showcase.componentLabels" -}}
{{ include "home-showcase.labels" .root }}
app.kubernetes.io/component: {{ .component }}
{{- end -}}
