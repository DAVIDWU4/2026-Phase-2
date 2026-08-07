# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["backend.csproj", "./"]
RUN dotnet restore "backend.csproj"

COPY . .
RUN dotnet publish "backend.csproj" -c Release -o /app/publish /p:GenerateRuntimeConfigurationFiles=true

# Runtime stage — Npgsql/PostgreSQL SSL may require Kerberos/GSS libraries on Linux
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libgssapi-krb5-2 \
        libkrb5-3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/publish .

# Disable appsettings file watchers — Render/Linux hits inotify instance limits otherwise
ENV DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false

EXPOSE 80 8080
ENTRYPOINT ["dotnet", "backend.dll"]